const mongoose = require("mongoose");

// 定义 MongoDB 连接参数
const username = "P2211355";
const rawPassword = "XHX123456";
const password = encodeURIComponent(rawPassword);
const cluster = "ecommerce.1rsj5.mongodb.net";
const dbName = "Ecommerce";
const options = "retryWrites=true&w=majority&appName=Ecommerce";

// 拼接 MongoDB 连接字符串
const mongoUrl = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?${options}`;

// 连接 MongoDB
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("成功连接到 MongoDB"))
  .catch((error) => console.error("连接 MongoDB 失败:", error));

module.exports = mongoose;