// 文件位置：/server/models/ShoppingCart.js
const mongoose = require('mongoose');

const ShoppingCartSchema = new mongoose.Schema({
  userID: { type: Number, required: true, unique: true }
  // 如有需要可以内嵌 CartItem 数组
});

module.exports = mongoose.model('ShoppingCart', ShoppingCartSchema);