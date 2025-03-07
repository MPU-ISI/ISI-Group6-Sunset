const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product'); 
const auth = require('../middleware/auth'); 
const { generateSequentialId } = require('../utils/idGenerator');

// 获取用户的愿望单
router.get('/', auth, async (req, res) => {
  try {
    const userID = req.user.userID; // 使用userID而不是id
    
    // 查找用户的愿望单
    let wishlist = await Wishlist.findOne({ userID });
    
    // 如果愿望单不存在，创建一个新的
    if (!wishlist) {
      const wishlistID = await generateSequentialId('Wishlist');
      wishlist = await Wishlist.create({
        wishlistID,
        userID
      });
    }
    
    // 获取愿望单中的所有商品
    const wishlistItems = await WishlistItem.find({ wishlistID: wishlist.wishlistID });
    
    // 获取商品详情
    const itemsWithDetails = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await Product.findOne({ productID: item.productID });
        return {
          id: item.wishlistItemID,
          productId: item.productID,
          name: product ? product.name : 'Unknown Product',
          price: product ? product.new_price : 0,
          img: product ? product.image : '',
          onSale: product ? (product.old_price > product.new_price) : false,
          quantity: item.quantity,
          subtotal: item.subtotal,
          sku_id: item.sku_id
        };
      })
    );
    
    res.json({
      success: true,
      wishlistId: wishlist.wishlistID,
      items: itemsWithDetails
    });
    
  } catch (error) {
    console.error('获取愿望单出错:', error);
    res.status(500).json({ success: false, errors: '服务器错误' });
  }
});

// 添加商品到愿望单
router.post('/add', auth, async (req, res) => {
  try {
    const userID = req.user.userID; // 使用userID而不是id
    const { productId, quantity = 1, sku_id } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, errors: '缺少商品ID' });
    }
    
    // 获取商品信息以计算小计
    const product = await Product.findOne({ productID: productId });
    if (!product) {
      return res.status(404).json({ success: false, errors: '商品不存在' });
    }
    
    // 查找或创建用户的愿望单
    let wishlist = await Wishlist.findOne({ userID });
    if (!wishlist) {
      const wishlistID = await generateSequentialId('Wishlist');
      wishlist = await Wishlist.create({
        wishlistID,
        userID
      });
    }
    
    // 检查商品是否已在愿望单中
    const existingItem = await WishlistItem.findOne({
      wishlistID: wishlist.wishlistID,
      productID: productId,
      sku_id: sku_id || { $exists: false }
    });
    
    if (existingItem) {
      // 更新已存在的商品数量和小计
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * product.new_price;
      await existingItem.save();
      
      return res.json({
        success: true,
        message: '更新愿望单商品数量成功',
        item: existingItem
      });
    }
    
    // 创建新的愿望单项目
    const subtotal = quantity * product.new_price;
    const wishlistItemID = await generateSequentialId('WishlistItem');
    
    const newItem = await WishlistItem.create({
      wishlistItemID,
      productID: productId,
      wishlistID: wishlist.wishlistID,
      sku_id: sku_id || undefined,
      quantity,
      subtotal
    });
    
    res.json({
      success: true,
      message: '添加到愿望单成功',
      item: newItem
    });
    
  } catch (error) {
    console.error('添加到愿望单出错:', error);
    res.status(500).json({ success: false, errors: '服务器错误' });
  }
});

// 从愿望单中移除商品
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const userID = req.user.userID;
    const wishlistItemID = parseInt(req.params.itemId);
    
    if (!wishlistItemID) {
      return res.status(400).json({ success: false, errors: '缺少愿望单项目ID' });
    }
    
    // 查找用户的愿望单
    const wishlist = await Wishlist.findOne({ userID });
    
    if (!wishlist) {
      return res.status(404).json({ success: false, errors: '愿望单不存在' });
    }
    
    // 查找并删除愿望单项目
    const wishlistItem = await WishlistItem.findOne({ 
      wishlistItemID,
      wishlistID: wishlist.wishlistID 
    });
    
    if (!wishlistItem) {
      return res.status(404).json({ success: false, errors: '愿望单项目不存在' });
    }
    
    await WishlistItem.deleteOne({ wishlistItemID });
    
    res.json({
      success: true,
      message: '从愿望单中移除商品成功'
    });
    
  } catch (error) {
    console.error('从愿望单移除商品出错:', error);
    res.status(500).json({ success: false, errors: '服务器错误' });
  }
});

// 清空愿望单
router.delete('/clear', auth, async (req, res) => {
  try {
    const userID = req.user.userID;
    
    // 查找用户的愿望单
    const wishlist = await Wishlist.findOne({ userID });
    
    if (!wishlist) {
      return res.status(404).json({ success: false, errors: '愿望单不存在' });
    }
    
    // 删除愿望单中的所有项目
    await WishlistItem.deleteMany({ wishlistID: wishlist.wishlistID });
    
    res.json({
      success: true,
      message: '愿望单已清空'
    });
    
  } catch (error) {
    console.error('清空愿望单出错:', error);
    res.status(500).json({ success: false, errors: '服务器错误' });
  }
});

module.exports = router;



module.exports = router;