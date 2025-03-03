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
app.use('/images', express.static('upload/images'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/wishlist", require("./routes/wishlist"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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