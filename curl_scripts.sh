#!/bin/bash
BASE=http://localhost:3000
# 1) Send OTP (mock)
curl -X POST $BASE/v1/auth/otp -H 'Content-Type: application/json' -d '{"phone":"+84901234567"}'
echo
# 2) Verify OTP (use otpFromDev if using mock)
curl -X POST $BASE/v1/auth/verify -H 'Content-Type: application/json' -d '{"phone":"+84901234567","otp":"123456"}'
echo
# 3) Create Momo order (replace TOKEN)
curl -X POST $BASE/v1/payments/momo/create -H 'Content-Type: application/json' -H 'Authorization: Bearer <TOKEN>' -d '{"amount":300000,"orderInfo":"Subscription 300k"}'
echo
# 4) Simulate webhook (compute signature separately)
curl -X POST $BASE/v1/payments/momo/webhook -H 'Content-Type: application/json' -d '{
  "partnerCode":"PARTNER",
  "accessKey":"ACCESS",
  "requestId":"req_123",
  "orderId":"order_123",
  "amount":"300000",
  "orderInfo":"Subscription",
  "orderType":"momo_wallet",
  "transId":"tx_123",
  "message":"Success",
  "localMessage":"Thành công",
  "responseTime":"2025-10-21 10:00:00",
  "resultCode":0,
  "payType":"qr",
  "extraData":"userId=user_123",
  "signature":"<computed_signature>"
}'
