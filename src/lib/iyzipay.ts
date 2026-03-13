import crypto from 'crypto';

export interface IyzicoRequest {
  locale: string;
  conversationId: string;
  price: number | string;
  paidPrice: number | string;
  currency: string;
  basketId: string;
  paymentGroup: string;
  callbackUrl: string;
  enabledInstallments?: number[];
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    lastLoginDate?: string;
    registrationDate?: string;
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
    itemType: string;
    price: number | string;
    paidPrice?: number | string;
  }[];
}

export async function initializeCheckoutForm(request: IyzicoRequest) {
  const apiKey = (process.env.IYZICO_API_KEY || "").trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || "").trim();
  const baseUrl = (process.env.IYZICO_BASE_URL || "").trim() || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('Iyzico API keys are missing in environment variables');
  }

  // 1. Refine Data for Strict V2 API Requirements
  
  // Format GSM Number: ensure +90 and no spaces
  if (request.buyer.gsmNumber) {
    const cleanPhone = request.buyer.gsmNumber.replace(/\D/g, '');
    let formatted = cleanPhone;
    if (cleanPhone.startsWith('90')) formatted = cleanPhone;
    else if (cleanPhone.startsWith('0')) formatted = '90' + cleanPhone.substring(1);
    else formatted = '90' + cleanPhone;
    request.buyer.gsmNumber = '+' + formatted;
  }

  // Convert Prices to Numbers (Iyzico V2 prefers Number types in JSON)
  const toNum = (p: any) => parseFloat(parseFloat(p).toFixed(2));
  
  request.price = toNum(request.price);
  request.paidPrice = toNum(request.paidPrice);
  
  request.basketItems = request.basketItems.map(item => ({
    ...item,
    price: toNum(item.price),
    paidPrice: toNum(item.price), // Usually equals price for e-commerce
    itemType: item.itemType || 'VIRTUAL'
  }));

  // Set Payment Group for Services
  request.paymentGroup = 'LISTING';
  
  // Clean optional fields that might have weird formatting
  delete request.buyer.registrationDate;
  delete request.buyer.lastLoginDate;

  // Use a longer random string forrnd
  const rnd = crypto.randomBytes(12).toString('hex');
  const payload = JSON.stringify(request);
  
  // Iyzico V2 Auth Generation
  const hashStr = apiKey + rnd + secretKey + payload;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(hashStr)
    .digest('hex');

  const authorization = Buffer.from(`${apiKey}:${signature}`).toString('base64');

  console.log(`DEBUG: Initializing Iyzico V2 - ConvID: ${request.conversationId}`);

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
    console.error("Iyzico Error Details:", JSON.stringify(data));
    throw new Error(`${data.errorMessage} (Code: ${data.errorCode})`);
  }

  return data;
}

export async function retrieveCheckoutForm(token: string) {
  const apiKey = (process.env.IYZICO_API_KEY || "").trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || "").trim();
  const baseUrl = (process.env.IYZICO_BASE_URL || "").trim() || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('Iyzico API keys are missing');
  }

  const rnd = crypto.randomBytes(12).toString('hex');
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
