// 文件位置：/server/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  categoryID: { type: Number, required: true, unique: true },
  categoryName: { type: String, required: true },
  parentCategoryID: { type: Number, default: null }
});

module.exports = mongoose.model('Category', CategorySchema);