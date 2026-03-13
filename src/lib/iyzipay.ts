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
  enabledInstallments?: number[];
  buyer: any;
  shippingAddress: any;
  billingAddress: any;
  basketItems: any[];
}

export async function initializeCheckoutForm(request: IyzicoRequest) {
  const apiKey = (process.env.IYZICO_API_KEY || "").trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || "").trim();
  const baseUrl = (process.env.IYZICO_BASE_URL || "").trim() || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('Iyzico API keys are missing in environment variables');
  }

  // 1. Strict Formatting for Iyzico V2 Sandbox
  
  // Prices MUST be strings with exactly 1 decimal digit (e.g., "150.0")
  const formatIyzicoPrice = (p: any) => {
    return parseFloat(p).toFixed(1);
  };

  request.price = formatIyzicoPrice(request.price);
  request.paidPrice = formatIyzicoPrice(request.paidPrice);
  
  request.basketItems = request.basketItems.map(item => ({
    ...item,
    price: formatIyzicoPrice(item.price),
    paidPrice: formatIyzicoPrice(item.price), // Mandatory for items
    itemType: item.itemType || 'VIRTUAL',
    category2: item.category1 // Sometimes required
  }));

  // Enabled installments can cause "Invalid Request" in sandbox if wrong
  delete request.enabledInstallments;
  
  // Revert to PRODUCT (Listing is sometimes only for specific sub-merchants)
  request.paymentGroup = 'PRODUCT';

  // Ensure buyer GSM is clean
  if (request.buyer.gsmNumber) {
    const cleanPhone = request.buyer.gsmNumber.replace(/\D/g, '');
    request.buyer.gsmNumber = '+' + (cleanPhone.startsWith('90') ? cleanPhone : '90' + (cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone));
  }

  // Identity number must be 11 digits
  request.buyer.identityNumber = request.buyer.identityNumber || '11111111111';

  const rnd = crypto.randomBytes(10).toString('hex');
  const payload = JSON.stringify(request);
  
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
    console.error("Iyzico Error Response:", JSON.stringify(data));
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

  const rnd = crypto.randomBytes(10).toString('hex');
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
