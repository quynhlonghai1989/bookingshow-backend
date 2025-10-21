import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

// Dữ liệu mẫu trong bộ nhớ (sau này bạn có thể thay bằng database)
let jobs = [
  {
    id: 1,
    title: "Quay phóng sự cưới Nha Trang",
    location: "Nha Trang",
    date: "2025-10-30",
    budget: "5,000,000 VND",
    client: "Studio A"
  },
  {
    id: 2,
    title: "Chụp ảnh fashion lookbook",
    location: "Đà Lạt",
    date: "2025-11-05",
    budget: "3,000,000 VND",
    client: "Boutique B"
  }
];

let users = [
  {
    id: 1,
    name: "Trần Quang",
    role: "Videographer",
    rating: 4.8,
    status: "available"
  },
  {
    id: 2,
    name: "Nguyễn Linh",
    role: "Photographer",
    rating: 4.6,
    status: "busy"
  }
];

// -------------------- ROUTES --------------------

// Kiểm tra hoạt động server
app.get("/", (req, res) => {
  res.send("✅ BookingShow Backend is running successfully!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy 💪" });
});

// 📸 Lấy danh sách job
app.get("/api/jobs", (req, res) => {
  res.json(jobs);
});

// 👤 Lấy danh sách người dùng (thợ quay/chụp)
app.get("/api/users", (req, res) => {
  res.json(users);
});

// ➕ Tạo job mới
app.post("/api/jobs", (req, res) => {
  const newJob = { id: jobs.length + 1, ...req.body };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

// ➕ Đăng ký user mới
app.post("/api/users", (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// -----------------------------------------------

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 BookingShow backend is running on port ${PORT}`);
});
