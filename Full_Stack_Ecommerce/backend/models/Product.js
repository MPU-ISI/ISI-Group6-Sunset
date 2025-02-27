const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }, 
  
  // 新增字段
  isConfigurable: { type: Boolean, default: false },
  productType: { type: String, default: 'simple' }, // 'simple' 或 'configurable'
  categoryID: { type: Number },
  
  // 引用相关的其他模型
  attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductAttribute' }],
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductOption' }],
  skus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SKU' }]
});

module.exports = mongoose.model("Product", ProductSchema);