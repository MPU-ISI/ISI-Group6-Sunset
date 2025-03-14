// models/ProductOption.js
const mongoose = require('mongoose');

const ProductOptionSchema = new mongoose.Schema({
  option_id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  option_name: { type: String }
});

module.exports = mongoose.model('ProductOption', ProductOptionSchema);