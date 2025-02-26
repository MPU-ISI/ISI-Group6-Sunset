// 文件位置：/server/models/ProductAttribute.js
const mongoose = require('mongoose');

const ProductAttributeSchema = new mongoose.Schema({
  attributeID: { type: Number, required: true, unique: true },
  productID: { type: Number, required: true },
  attributeName: { type: String, required: true },
  details: { type: String }
});

module.exports = mongoose.model('ProductAttribute', ProductAttributeSchema);