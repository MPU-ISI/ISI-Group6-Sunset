// 文件位置：/server/models/Search.js
const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
  search_id: { type: Number, required: true, unique: true },
  userID: { type: Number, required: true },
  query: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Search', SearchSchema);