import crypto from 'crypto';

// ─── V2 Auth (matches official iyzipay SDK utils.js exactly) ─────────────────
function generateRandomString(): string {
  return process.hrtime()[0] + Math.random().toString(8).slice(2);
}

function generateAuthV2(
  apiKey: string,
  secretKey: string,
  uriPath: string,
  body: object,
  randomString: string
): string {
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(randomString + uriPath + JSON.stringify(body))
    .digest('hex');

  const authorizationParams = [
    'apiKey:' + apiKey,
    'randomKey:' + randomString,
    'signature:' + signature,
  ];

  return 'IYZWSv2 ' + Buffer.from(authorizationParams.join('&')).toString('base64');
}

// ─── Price formatter (Iyzico rejects "1250.00" but wants "1250.0" style) ──────
// Actually Iyzico sandbox accepts both; we use toFixed(2) for consistency.
function formatPrice(p: number | string): string {
  return parseFloat(p.toString()).toFixed(2);
}

// ─── Initialize Checkout Form ─────────────────────────────────────────────────
export async function initializeCheckoutForm(request: any) {
  const apiKey    = (process.env.IYZICO_API_KEY    || '').trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
  const baseUrl   = (process.env.IYZICO_BASE_URL   || 'https://sandbox-api.iyzipay.com').trim();

  if (!apiKey || !secretKey) throw new Error('Iyzico API keys missing');

  const uriPath = '/payment/iyzipos/checkoutform/initialize/auth/ecom';

  const body = {
    locale:               request.locale        || 'tr',
    conversationId:       request.conversationId,
    price:                formatPrice(request.price),
    paidPrice:            formatPrice(request.paidPrice),
    currency:             request.currency       || 'TRY',
    basketId:             request.basketId,
    paymentGroup:         'PRODUCT',
    enabledInstallments:  request.enabledInstallments || [1],
    callbackUrl:          request.callbackUrl,
    buyer: {
      id:                  request.buyer.id,
      name:                request.buyer.name,
      surname:             request.buyer.surname,
      gsmNumber:           request.buyer.gsmNumber,
      email:               request.buyer.email,
      identityNumber:      '74300864791',
      registrationAddress: request.buyer.registrationAddress || 'Ortakoy, Istanbul',
      ip:                  '85.34.78.112',
      city:                request.buyer.city    || 'Istanbul',
      country:             request.buyer.country || 'Turkey',
      zipCode:             request.buyer.zipCode  || '34347',
    },
    shippingAddress: {
      contactName: request.shippingAddress?.contactName || request.buyer.name + ' ' + request.buyer.surname,
      city:        request.shippingAddress?.city        || 'Istanbul',
      country:     request.shippingAddress?.country     || 'Turkey',
      address:     request.shippingAddress?.address     || 'Ortakoy, Istanbul',
      zipCode:     request.shippingAddress?.zipCode     || '34347',
    },
    billingAddress: {
      contactName: request.billingAddress?.contactName || request.buyer.name + ' ' + request.buyer.surname,
      city:        request.billingAddress?.city        || 'Istanbul',
      country:     request.billingAddress?.country     || 'Turkey',
      address:     request.billingAddress?.address     || 'Ortakoy, Istanbul',
      zipCode:     request.billingAddress?.zipCode     || '34347',
    },
    basketItems: request.basketItems.map((item: any) => ({
      id:        item.id,
      name:      item.name,
      category1: item.category1 || 'Beauty',
      category2: 'Service',
      itemType:  item.itemType  || 'VIRTUAL',
      price:     formatPrice(item.price),
    })),
  };

  const randomString  = generateRandomString();
  const authorization = generateAuthV2(apiKey, secretKey, uriPath, body, randomString);

  console.log('DEBUG Iyzico request body:', JSON.stringify(body));
  console.log('DEBUG Iyzico uriPath:', uriPath);

  const response = await fetch(`${baseUrl}${uriPath}`, {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-iyzi-rnd':           randomString,
      'x-iyzi-client-version': 'iyzipay-node-2.0.65',
      'Authorization':         authorization,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.status !== 'success') {
    console.error('DEBUG Iyzico failure payload:', JSON.stringify(body));
    console.error('DEBUG Iyzico failure response:', JSON.stringify(data));
    throw new Error(`${data.errorMessage} (Code: ${data.errorCode})`);
  }

  return data;
}

// ─── Retrieve Checkout Form (callback) ───────────────────────────────────────
export async function retrieveCheckoutForm(token: string) {
  const apiKey    = (process.env.IYZICO_API_KEY    || '').trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
  const baseUrl   = (process.env.IYZICO_BASE_URL   || 'https://sandbox-api.iyzipay.com').trim();

  const uriPath     = '/payment/iyzipos/checkoutform/auth/ecom/detail';
  const randomString = generateRandomString();

  const body = {
    locale:         'tr',
    conversationId: randomString,
    token:          token,
  };

  const authorization = generateAuthV2(apiKey, secretKey, uriPath, body, randomString);

  const response = await fetch(`${baseUrl}${uriPath}`, {
    method: 'POST',
    headers: {
      'Content-Type':          'application/json',
      'x-iyzi-rnd':            randomString,
      'x-iyzi-client-version': 'iyzipay-node-2.0.65',
      'Authorization':          authorization,
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

// ─── Cancel Payment (Full refund for same-day or pending settlement) ─────────
export async function cancelPayment(paymentId: string) {
  const apiKey    = (process.env.IYZICO_API_KEY    || '').trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
  const baseUrl   = (process.env.IYZICO_BASE_URL   || 'https://sandbox-api.iyzipay.com').trim();

  const uriPath     = '/payment/iyzipos/cancel';
  const randomString = generateRandomString();

  const body = {
    locale:         'tr',
    conversationId: randomString,
    paymentId:      paymentId,
    ip:             '85.34.78.112',
  };

  const authorization = generateAuthV2(apiKey, secretKey, uriPath, body, randomString);

  const response = await fetch(`${baseUrl}${uriPath}`, {
    method: 'POST',
    headers: {
      'Content-Type':          'application/json',
      'x-iyzi-rnd':            randomString,
      'x-iyzi-client-version': 'iyzipay-node-2.0.65',
      'Authorization':          authorization,
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}
