// 文件位置：/server/models/OptionValues.js
const mongoose = require('mongoose');

const OptionValuesSchema = new mongoose.Schema({
  value_id: { type: Number,},
  option_id: { type: Number, required: true },
  value_name: { type: String, required: true }
});

OptionValuesSchema.index({ option_id: 1, value_name: 1 }, { unique: true });
module.exports = mongoose.model('OptionValues', OptionValuesSchema);