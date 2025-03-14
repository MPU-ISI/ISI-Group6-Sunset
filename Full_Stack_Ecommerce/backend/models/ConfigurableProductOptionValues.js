// 文件位置：/server/models/ConfigurableProductOptionValues.js
const mongoose = require('mongoose');

const ConfigurableProductOptionValuesSchema = new mongoose.Schema({
  configurable_value_id: { type: Number, required: true, unique: true },
  configurable_option_id: { type: Number, required: true },
  value_id: { type: Number, required: true }
});

module.exports = mongoose.model('ConfigurableProductOptionValues', ConfigurableProductOptionValuesSchema);