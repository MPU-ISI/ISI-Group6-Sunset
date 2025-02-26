// 文件位置：/server/models/Preference.js
const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
  preferenceID: { type: Number, required: true, unique: true },
  userID: { type: Number, required: true },
  categoryID: { type: Number, required: true }
});

module.exports = mongoose.model('Preference', PreferenceSchema);