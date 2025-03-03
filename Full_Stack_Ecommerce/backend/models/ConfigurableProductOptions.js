// 文件位置：/server/models/ConfigurableProductOptions.js
const mongoose = require('mongoose');

const ConfigurableProductOptionsSchema = new mongoose.Schema({
  configurable_option_id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  option_id: { type: Number, required: true }
});

module.exports = mongoose.model('ConfigurableProductOptions', ConfigurableProductOptionsSchema);