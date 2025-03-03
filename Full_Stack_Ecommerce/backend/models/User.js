// 文件位置：/server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userID: { type: Number, required: true, unique: true },
  userName: { type: String, required: true },
  password: { type: String, required: true }, // 生产环境中建议对密码进行加密存储
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String }, // 将 Email 转为小写更为统一
  address: { type: String }
});

module.exports = mongoose.model('User', UserSchema);