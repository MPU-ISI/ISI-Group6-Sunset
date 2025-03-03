// 文件位置：/server/models/OrderItem.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  orderItemID: { type: Number, required: true, unique: true },
  productID: { type: Number, required: true },
  orderID: { type: Number, required: true },
  sku_id: { type: Number },
  quantity: { type: Number, required: true }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);