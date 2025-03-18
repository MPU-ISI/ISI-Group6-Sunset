// index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("./config/db"); // Database connection

const app = express();
const port = process.env.PORT || 4000;

// 添加错误处理以捕获连接问题
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connected successfully');
});

// Middleware
app.use(express.json());
app.use(cors());

// 添加全局响应头中间件
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/images', express.static('upload/images'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/wishlist", require("./routes/wishlist"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    errors: "Route not found"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });

  res.status(500).json({
    success: false,
    errors: err.message || "Something went wrong!"
  });
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});