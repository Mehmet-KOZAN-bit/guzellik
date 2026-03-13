import crypto from 'crypto';

export interface IyzicoRequest {
  locale: string;
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentGroup: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
    zipCode: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  basketItems: {
    id: string;
    name: string;
    category1: string;
    category2: string;
    itemType: string;
    price: string;
  }[];
}

export async function initializeCheckoutForm(request: any) {
  const apiKey = (process.env.IYZICO_API_KEY || "").trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || "").trim();
  const baseUrl = (process.env.IYZICO_BASE_URL || "").trim() || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('Iyzico API keys are missing in environment variables');
  }

  // 1. Strict Formatting for Iyzico V2 (User requested string format with 2 decimals)
  const formatIyzPrice = (p: any) => parseFloat(p.toString()).toFixed(2);

  const cleanRequest = {
    locale: request.locale || 'tr',
    conversationId: request.conversationId,
    price: formatIyzPrice(request.price),
    paidPrice: formatIyzPrice(request.paidPrice),
    currency: request.currency || 'TRY',
    basketId: request.basketId,
    paymentGroup: 'PRODUCT',
    callbackUrl: request.callbackUrl.split('?')[0], // Base URL without query params
    buyer: {
      id: request.buyer.id,
      name: request.buyer.name,
      surname: request.buyer.surname,
      gsmNumber: request.buyer.gsmNumber.startsWith('+') ? request.buyer.gsmNumber : ('+90' + request.buyer.gsmNumber.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')),
      email: request.buyer.email,
      // User suggested this specific identity number for sandbox
      identityNumber: '74300864791', 
      registrationAddress: request.buyer.registrationAddress,
      ip: '127.0.0.1', // Safer for sandbox/local testing
      city: request.buyer.city,
      country: request.buyer.country,
      zipCode: request.buyer.zipCode
    },
    shippingAddress: request.shippingAddress,
    billingAddress: request.billingAddress,
    basketItems: request.basketItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      category1: item.category1 || 'Beauty',
      category2: item.category2 || 'Service',
      itemType: item.itemType || 'VIRTUAL',
      price: formatIyzPrice(item.price),
    }))
  };

  const rnd = crypto.randomBytes(8).toString('hex');
  const payload = JSON.stringify(cleanRequest);
  
  // Iyzico V2 Auth Generation
  const hashStr = apiKey + rnd + secretKey + payload;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(hashStr)
    .digest('hex');

  const authorization = Buffer.from(`${apiKey}:${signature}`).toString('base64');

  const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-iyzi-rnd': rnd,
      'Authorization': `IYZWSv2 ${authorization}`,
    },
    body: payload,
  });

  const data = await response.json();

  if (data.status !== 'success') {
    console.error("DEBUG: Iyzico Failure Payload:", payload);
    console.error("DEBUG: Iyzico Failure Response:", JSON.stringify(data));
    throw new Error(`${data.errorMessage} (Code: ${data.errorCode})`);
  }

  return data;
}

export async function retrieveCheckoutForm(token: string) {
  const apiKey = (process.env.IYZICO_API_KEY || "").trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || "").trim();
  const baseUrl = (process.env.IYZICO_BASE_URL || "").trim() || 'https://sandbox-api.iyzipay.com';

  const rnd = crypto.randomBytes(8).toString('hex');
  const requestBody = {
    locale: 'tr',
    conversationId: rnd,
    token: token,
  };
  const payload = JSON.stringify(requestBody);
  
  const hashStr = apiKey + rnd + secretKey + payload;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(hashStr)
    .digest('hex');

  const authorization = Buffer.from(`${apiKey}:${signature}`).toString('base64');

  const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-iyzi-rnd': rnd,
      'Authorization': `IYZWSv2 ${authorization}`,
    },
    body: payload,
  });

  return await response.json();
}
