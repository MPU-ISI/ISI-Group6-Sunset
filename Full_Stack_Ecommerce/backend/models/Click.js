// 文件位置：/server/models/Click.js
const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  click_id: { type: Number, required: true, unique: true },
  userID: { type: Number, required: true },
  productID: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Click', ClickSchema);