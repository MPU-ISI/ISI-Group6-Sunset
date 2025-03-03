// 文件位置：/server/models/PromotionProduct.js
const mongoose = require('mongoose');

const PromotionProductSchema = new mongoose.Schema({
  promotionProductID: { type: Number, required: true, unique: true },
  promotionID: { type: Number, required: true },
  productID: { type: Number, required: true }
});

module.exports = mongoose.model('PromotionProduct', PromotionProductSchema);