// 文件位置：/server/models/Wishlist.js
const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  wishlistID: { type: Number, required: true, unique: true },
  userID: { type: Number, required: true }
});

module.exports = mongoose.model('Wishlist', WishlistSchema);