// 文件位置：/server/models/Promotion.js
const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  promotionID: { type: Number, required: true, unique: true },
  promotionName: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  discount: { type: Number }
});

module.exports = mongoose.model('Promotion', PromotionSchema);