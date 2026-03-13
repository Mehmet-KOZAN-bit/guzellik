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
  enabledInstallments: number[];
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

  // Ensure phone starts with +90 for Turkish numbers
  if (request.buyer.gsmNumber && !request.buyer.gsmNumber.startsWith('+')) {
    const cleanPhone = request.buyer.gsmNumber.replace(/\D/g, '');
    request.buyer.gsmNumber = `+90${cleanPhone.startsWith('90') ? cleanPhone.substring(2) : (cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone)}`;
  }

  // Ensure prices are formatted correctly: no trailing .0 if integer, otherwise 2 decimals
  const formatPrice = (p: any) => {
    const val = parseFloat(p);
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  };
  
  request.price = formatPrice(request.price);
  request.paidPrice = formatPrice(request.paidPrice);
  request.basketItems = request.basketItems.map(item => ({
    ...item,
    price: formatPrice(item.price)
  }));

  const rnd = Math.random().toString(36).substring(2, 12);
  const payload = JSON.stringify(request);
  
  // Iyzico V2 Auth Generation
  const hashStr = apiKey + rnd + secretKey + payload;
  console.log("DEBUG: Iyzico Auth String Prefix:", hashStr.substring(0, 30));
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(hashStr)
    .digest('hex');

  const authorization = Buffer.from(`${apiKey}:${signature}`).toString('base64');

  console.log("DEBUG: Iyzico Request Payload:", payload);

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
  console.log("DEBUG: Iyzico Response Data:", JSON.stringify(data));

  if (data.status !== 'success') {
    throw new Error(`${data.errorMessage} (Code: ${data.errorCode})`);
  }

  return data;
}

export async function retrieveCheckoutForm(token: string) {
  const apiKey = (process.env.IYZICO_API_KEY || "").trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || "").trim();
  const baseUrl = (process.env.IYZICO_BASE_URL || "").trim() || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('Iyzico API keys are missing in environment variables');
  }

  const rnd = Math.random().toString(36).substring(2, 12);
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
