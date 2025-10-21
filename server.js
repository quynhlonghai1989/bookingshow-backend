// BookingShow Backend - Render Ready Version
// ------------------------------------------
// Hỗ trợ: Express server, test API, MoMo payment mock.

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// Đọc PORT từ Render (hoặc mặc định 10000 khi chạy cục bộ)
const PORT = process.env.PORT || 10000;

// 🧠 Route kiểm tra hoạt động
app.get("/", (req, res) => {
  res.send("✅ BookingShow Backend is running successfully!");
});

// 🩺 Route health check (dành cho Render)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy 💪" });
});

// 💰 Route test thanh toán MoMo (mock)
app.post("/api/momo/test", async (req, res) => {
  try {
    const { amount } = req.body;

    // Nếu chưa có key thực, chỉ trả về dữ liệu giả lập
    if (!process.env.MOMO_PARTNER_CODE) {
      return res.json({
        message: "🧪 Test mode: MoMo keys not configured",
        amount,
        status: "success",
      });
    }

    // Nếu có thông tin thật từ Render Environment
    const response = await axios.post(process.env.MOMO_ENDPOINT, {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      amount,
      requestType: "captureWallet",
    });

    res.json({
      message: "MoMo payment initiated",
      momoResponse: response.data,
    });
  } catch (err) {
    console.error("MoMo API error:", err.message);
    res.status(500).json({ error: "MoMo payment failed" });
  }
});

// ✅ Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 BookingShow backend is running on port ${PORT}`);
});
