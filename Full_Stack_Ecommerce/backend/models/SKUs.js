// models/SKUs.js
const mongoose = require('mongoose');

const SKUsSchema = new mongoose.Schema({
  sku_id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  configurable_value_ids: { type: String }, // 可存储 JSON 格式的字符串
  sku_code: { type: String },
  inventory_status: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  image_url: { type: String }
});

// 添加一个虚拟属性，自动将 configurable_value_ids 转换为 configurable_values 对象
SKUsSchema.virtual('configurable_values').get(function() {
  if (!this.configurable_value_ids) return {};
  
  try {
    return JSON.parse(this.configurable_value_ids);
  } catch (e) {
    console.error("Error parsing configurable_value_ids:", e);
    return {};
  }
});

// 确保虚拟字段在JSON和Object转换时包含在内
SKUsSchema.set('toJSON', { virtuals: true });
SKUsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SKU', SKUsSchema);