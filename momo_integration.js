const axios = require('axios');
const crypto = require('crypto');

function buildRawString(params, orderedKeys) {
  return orderedKeys.map(k => `${k}=${params[k] ?? ''}`).join('&');
}
function signHmacSha256(rawString, secret) {
  return crypto.createHmac('sha256', secret).update(rawString).digest('hex');
}

async function createMomoOrder({ amount, orderId, requestId, orderInfo, returnUrl, notifyUrl }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

  const params = {
    partnerCode,
    accessKey,
    requestId,
    amount: String(amount),
    orderId,
    orderInfo,
    returnUrl,
    notifyUrl,
    extraData: '',
  };
  // order of keys must match MoMo spec
  const raw = buildRawString(params, ['partnerCode','accessKey','requestId','amount','orderId','orderInfo','returnUrl','notifyUrl','extraData']);
  const signature = signHmacSha256(raw, secretKey);

  const payload = { ...params, signature };
  const r = await axios.post(endpoint, payload, { timeout: 10000 });
  return r.data;
}

module.exports = { createMomoOrder, signHmacSha256, buildRawString };
