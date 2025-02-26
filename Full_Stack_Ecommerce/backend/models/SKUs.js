// 文件位置：/server/models/SKUs.js
const mongoose = require('mongoose');

const SKUsSchema = new mongoose.Schema({
  sku_id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  configurable_value_ids: { type: String }, // 可存储 JSON 格式的字符串，或转换为数组 [Number]
  sku_code: { type: String },
  inventory_status: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  image_url: { type: String }
});

module.exports = mongoose.model('SKUs', SKUsSchema);