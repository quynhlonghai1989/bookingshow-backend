const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const cors = require('cors');
const { createMomoOrder, signHmacSha256, buildRawString } = require('./momo_integration');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const users = {}; // in-memory

function signForUser(user) {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  return token;
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization' });
  const parts = auth.split(' ');
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/v1/auth/otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const otp = '123456';
  let user = Object.values(users).find(u => u.phone === phone);
  if (!user) {
    const id = uuidv4();
    user = { id, phone, role: 'client', subscription_status: 'past_due', name: null };
    users[id] = user;
  }
  user.lastOtp = otp;
  return res.json({ ok: true, otpForDev: otp, userId: user.id });
});

app.post('/v1/auth/verify', (req, res) => {
  const { phone, otp } = req.body;
  const user = Object.values(users).find(u => u.phone === phone);
  if (!user || user.lastOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  const token = signForUser(user);
  return res.json({ token, user });
});

app.post('/v1/payments/momo/create', authMiddleware, async (req, res) => {
  try {
    const amount = req.body.amount || 300000;
    const orderId = `order_${Date.now()}`;
    const requestId = `req_${Date.now()}`;
    const orderInfo = req.body.orderInfo || 'Subscription 300k VND';
    const returnUrl = process.env.MOMO_RETURN_URL || 'https://yourapp.example.com/momo/return';
    const notifyUrl = process.env.MOMO_NOTIFY_URL || `${process.env.PUBLIC_URL || 'http://localhost:3000'}/v1/payments/momo/webhook`;

    const momoResp = await createMomoOrder({ amount, orderId, requestId, orderInfo, returnUrl, notifyUrl });

    const u = users[req.user.id];
    u.pendingPayment = { orderId, amount, momoResp };

    return res.json({ ok: true, momoResp });
  } catch (err) {
    console.error('create momo order error', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create momo order' });
  }
});

app.post('/v1/payments/momo/webhook', (req, res) => {
  const data = req.body;
  const secret = process.env.MOMO_SECRET_KEY || 'secret';
  const raw = buildRawString({ partnerCode: data.partnerCode, accessKey: data.accessKey, requestId: data.requestId, amount: data.amount, orderId: data.orderId, orderInfo: data.orderInfo, orderType: data.orderType, transId: data.transId, message: data.message, localMessage: data.localMessage, responseTime: data.responseTime, resultCode: data.resultCode, payType: data.payType, extraData: data.extraData }, ['partnerCode','accessKey','requestId','amount','orderId','orderInfo','orderType','transId','message','localMessage','responseTime','resultCode','payType','extraData']);
  const expected = signHmacSha256(raw, secret);
  if (expected !== data.signature) return res.status(400).json({ error: 'Invalid signature' });

  let userId = null;
  if (data.extraData) {
    const parts = data.extraData.split(';').map(s=>s.split('='));
    for (const p of parts) if (p[0]==='userId') userId = p[1];
  }
  const u = userId ? users[userId] : Object.values(users).find(x=>x.pendingPayment && x.pendingPayment.orderId === data.orderId);

  if (!u) return res.json({ ok: true });

  if (Number(data.resultCode) === 0) {
    u.subscription_status = 'active';
    u.subscription_renewal = new Date(Date.now() + 30*24*3600*1000).toISOString();
    u.payments = u.payments || [];
    u.payments.push({ provider: 'momo', txn: data.transId, orderId: data.orderId, amount: Number(data.amount), status: 'success' });
    delete u.pendingPayment;
    console.log(`Subscription activated for user ${u.id}`);
  } else {
    u.payments = u.payments || [];
    u.payments.push({ provider: 'momo', txn: data.transId, orderId: data.orderId, amount: Number(data.amount), status: 'failed' });
  }

  return res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`BookingShow demo backend running on http://localhost:${port}`));
