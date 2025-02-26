// 文件位置：/server/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productID: { type: Number, required: true, unique: true },
  productName: { type: String, required: true },
  description: { type: String },
  categoryID: { type: Number },
  productType: { type: String }, // 对应 SQL 中 product_type
  isConfigurable: { type: Boolean, default: false } // 对应 is_configerable
});

module.exports = mongoose.model('Product', ProductSchema);