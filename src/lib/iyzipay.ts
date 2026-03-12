import Iyzipay from 'iyzipay';

let _iyzipay: Iyzipay | null = null;

function getIyzipay(): Iyzipay {
  if (!_iyzipay) {
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;

    if (!apiKey || !secretKey) {
      throw new Error('IYZICO_API_KEY and IYZICO_SECRET_KEY must be set in .env.local');
    }

    _iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });
  }
  return _iyzipay;
}

export default getIyzipay;
