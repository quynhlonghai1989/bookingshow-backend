BookingShow - Quick Deploy README

Included files:
- Dockerfile: simple container for Node backend
- momo_integration.js: module to create MoMo order (uses env vars)
- payment_momo_flow.dart: Flutter screen to start payment flow (call backend then open payUrl)
- postman_collection.json: Postman collection for quick API testing
- curl_scripts.sh: bash scripts to test common flows locally

Quick steps:
1) Fill env vars:
   - JWT_SECRET
   - MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY
   - MOMO_NOTIFY_URL (public webhook endpoint)
   - PUBLIC_URL (your public base url)
2) Build and run locally:
   - npm install
   - node index.js
   - or using Docker: docker build -t bookingshow . && docker run -p 3000:3000 -e JWT_SECRET=secret bookingshow
3) Use Postman collection or curl scripts to test.
4) To deploy to Render: push repository to GitHub, create Web Service on Render, set env vars, and deploy.

Notes:
- The momo_integration.js expects MoMo sandbox API structure. Adjust payload key order if MoMo updates their spec.
- Compute signatures for webhook simulation using same secret as MOMO_SECRET_KEY.
