// models/Images.js
const mongoose = require('mongoose');

const ImagesSchema = new mongoose.Schema({
  imageID: { type: Number, required: true, unique: true },
  productID: { type: Number, required: true },
  image_url: { type: String }
});

module.exports = mongoose.model('Images', ImagesSchema);