// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productID: { type: Number, required: true, unique: true }, // 主要ID字段
  id: { type: Number }, // 保留此字段以兼容旧代码
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  additional_images: [{ type: String }],
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }, 
  
  isConfigurable: { type: Boolean, default: false },
  productType: { type: String, default: 'simple' },
  categoryID: { type: Number },
  
  attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductAttribute' }],
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductOption' }],
  skus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SKU' }]
});

module.exports = mongoose.model("Product", ProductSchema);