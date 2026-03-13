import { NextResponse } from 'next/server';
import { cancelPayment } from '@/lib/iyzipay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // 1. Get the appointment to find the paymentId
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);

    if (!appointmentSnap.exists()) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointmentData = appointmentSnap.data();
    const paymentId = appointmentData.paymentId;

    if (!paymentId) {
      return NextResponse.json({ error: 'No valid payment ID associated to refund' }, { status: 400 });
    }

    // 2. Call Iyzico Cancel Payment API
    const refundResult = await cancelPayment(paymentId);

    if (refundResult.status !== 'success') {
      console.error("Iyzico cancel error:", JSON.stringify(refundResult));
      return NextResponse.json({ 
        error: refundResult.errorMessage || 'Failed to refund via Iyzico',
        code: refundResult.errorCode
      }, { status: 400 });
    }

    // 3. Update Firestore Document Status
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      paymentStatus: 'refunded', // Update status to reflect successful refund
      cancelledAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Payment successfully refunded and appointment cancelled.' });

  } catch (error: any) {
    console.error("Refund route error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
