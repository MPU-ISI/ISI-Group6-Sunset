// 文件位置：/server/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderID: { type: Number, required: true, unique: true },
  userID: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  statusID: { type: Number, required: true },
  status_modify_date: { type: Date, default: Date.now },
  address: { type: String }
});

module.exports = mongoose.model('Order', OrderSchema);