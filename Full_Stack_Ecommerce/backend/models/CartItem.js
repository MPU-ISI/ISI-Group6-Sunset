// 文件位置：/server/models/CartItem.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  cartItemID: { type: Number, required: true, unique: true },
  productID: { type: Number, required: true },
  userID: { type: Number, required: true },
  sku_id: { type: Number },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

module.exports = mongoose.model('CartItem', CartItemSchema);