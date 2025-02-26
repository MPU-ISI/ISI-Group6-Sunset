// 文件位置：/server/models/OptionValues.js
const mongoose = require('mongoose');

const OptionValuesSchema = new mongoose.Schema({
  value_id: { type: Number, required: true, unique: true },
  option_id: { type: Number, required: true },
  value_name: { type: String, required: true }
});

module.exports = mongoose.model('OptionValues', OptionValuesSchema);