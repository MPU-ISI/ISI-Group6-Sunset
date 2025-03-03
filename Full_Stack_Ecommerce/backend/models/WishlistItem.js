// 文件位置：/server/models/WishlistItem.js
const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
  wishlistItemID: { type: Number, required: true, unique: true },
  productID: { type: Number, required: true },
  wishlistID: { type: Number, required: true },
  sku_id: { type: Number },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

module.exports = mongoose.model('WishlistItem', WishlistItemSchema);