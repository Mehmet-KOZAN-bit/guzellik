import { NextResponse } from 'next/server';
import { initializeCheckoutForm } from '@/lib/iyzipay';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { SERVICE_PRICES } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, service, date, time, message } = body;

    if (!name || !phone || !email || !service || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const servicePrice = SERVICE_PRICES[service] || 500;
    const depositAmount = servicePrice / 2; // 50% deposit

    // Normalize name for Iyzico
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'The Beauty Side';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    // Normalize phone for Iyzico (+90...)
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('90')
      ? `+${cleanPhone}`
      : cleanPhone.startsWith('0')
        ? `+90${cleanPhone.slice(1)}`
        : `+90${cleanPhone}`;

    // 1. Create a pending appointment in Firestore FIRST
    const appointmentData = {
      name,
      phone: formattedPhone,
      email,
      service,
      servicePrice,
      depositAmount,
      date,
      time,
      message: message || '',
      status: 'pending',
      paymentStatus: 'pending',
      paymentId: '', // will be updated via callback
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
    const appointmentId = docRef.id;

    // 2. Initialize iyzico checkout form
    const request = {
      locale: 'tr',
      conversationId: appointmentId,
      price: depositAmount.toFixed(2),
      paidPrice: depositAmount.toFixed(2),
      currency: 'TRY',
      basketId: `B-${appointmentId}`,
      paymentGroup: 'PRODUCT',
      enabledInstallments: [1],
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback?id=${appointmentId}`,
      buyer: {
        id: `BY-${Date.now()}`,
        name: firstName,
        surname: lastName,
        gsmNumber: formattedPhone,
        email: email,
        identityNumber: '74300864791', // Strict sandbox identity
        registrationAddress: 'Ortakoy, Istanbul',
        ip: '85.34.78.112', // Valid IP required by Iyzico sandbox
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34347'
      },
      shippingAddress: {
        contactName: name,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Ortakoy, Istanbul',
        zipCode: '34347'
      },
      billingAddress: {
        contactName: name,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Ortakoy, Istanbul',
        zipCode: '34347'
      },
      basketItems: [
        {
          id: service,
          name: `Deposit for ${service}`,
          category1: 'Beauty',
          category2: 'Service',
          itemType: 'VIRTUAL',
          price: depositAmount.toFixed(2)
        }
      ]
    };

    const result = await initializeCheckoutForm(request as any);

    // Return the payment page URL to redirect the user
    return NextResponse.json({
      paymentPageUrl: result.paymentPageUrl + '&iframe=false'
    });

  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
