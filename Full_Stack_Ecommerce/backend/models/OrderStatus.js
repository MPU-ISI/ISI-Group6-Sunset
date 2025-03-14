// 文件位置：/server/models/OrderStatus.js
const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema({
  statusID: { type: Number, required: true, unique: true },
  statusName: { type: String }
});

module.exports = mongoose.model('OrderStatus', OrderStatusSchema);