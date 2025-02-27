const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product"); 
const fetchuser = require("../middleware/auth");

// 添加到购物车
router.post('/add', fetchuser, async (req, res) => {
  try {
    const { productId, skuId, quantity = 1 } = req.body;
    const userId = req.user.userID; // 假设middleware设置了user对象
    
    // 查找产品和SKU以获取价格
    let productPrice = 0;
    const product = await Product.findOne({ id: productId });
    
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    // 如果是可配置产品并且提供了skuId，则使用SKU价格
    if (skuId && product.isConfigurable) {
      const sku = product.skus.find(s => s.sku_id === skuId);
      if (!sku) {
        return res.status(404).json({ success: false, error: "SKU not found" });
      }
      productPrice = sku.price;
    } else {
      productPrice = product.new_price;
    }
    
    // 计算小计
    const subtotal = productPrice * quantity;
    
    // 检查购物车中是否已存在相同的产品/SKU组合
    let cartItem = await CartItem.findOne({
      productID: productId,
      userID: userId,
      sku_id: skuId || null
    });
    
    if (cartItem) {
      // 更新现有购物车项
      cartItem.quantity += quantity;
      cartItem.subtotal = cartItem.quantity * productPrice;
      await cartItem.save();
    } else {
      // 生成新的cartItemID (您可能有自己的ID生成逻辑)
      const lastCartItem = await CartItem.findOne().sort({ cartItemID: -1 });
      const newCartItemID = lastCartItem ? lastCartItem.cartItemID + 1 : 1;
      
      // 创建新的购物车项
      cartItem = new CartItem({
        cartItemID: newCartItemID,
        productID: productId,
        userID: userId,
        sku_id: skuId || null,
        quantity: quantity,
        subtotal: subtotal
      });
      
      await cartItem.save();
    }
    
    res.json({ 
      success: true, 
      message: "Item added to cart",
      cartItem: cartItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 从购物车移除
router.post('/remove', fetchuser, async (req, res) => {
  try {
    const { productId, skuId, quantity = 1 } = req.body;
    const userId = req.user.userID;
    
    // 查找购物车项
    const cartItem = await CartItem.findOne({
      productID: productId,
      userID: userId,
      sku_id: skuId || null
    });
    
    if (!cartItem) {
      return res.status(404).json({ success: false, error: "Cart item not found" });
    }
    
    // 查找产品以获取最新价格
    const product = await Product.findOne({ id: productId });
    let productPrice = 0;
    
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    // 确定价格
    if (skuId && product.isConfigurable) {
      const sku = product.skus.find(s => s.sku_id === skuId);
      if (sku) {
        productPrice = sku.price;
      } else {
        productPrice = product.new_price;
      }
    } else {
      productPrice = product.new_price;
    }
    
    // 减少数量或删除
    if (cartItem.quantity > quantity) {
      cartItem.quantity -= quantity;
      cartItem.subtotal = cartItem.quantity * productPrice;
      await cartItem.save();
    } else {
      // 如果减少的数量大于等于当前数量，则删除项目
      await CartItem.deleteOne({ _id: cartItem._id });
    }
    
    res.json({ 
      success: true, 
      message: "Item removed from cart"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 获取用户的购物车
router.get('/', fetchuser, async (req, res) => {
  try {
    const userId = req.user.userID;
    
    // 获取该用户的所有购物车项
    const cartItems = await CartItem.find({ userID: userId });
    
    // 获取所有相关产品信息
    const productIds = [...new Set(cartItems.map(item => item.productID))];
    const products = await Product.find({ id: { $in: productIds } });
    
    // 构建增强的购物车数据
    const enhancedCart = await Promise.all(
      cartItems.map(async (item) => {
        const product = products.find(p => p.id === item.productID);
        
        if (!product) return null;
        
        let skuInfo = null;
        if (item.sku_id && product.isConfigurable) {
          skuInfo = product.skus.find(s => s.sku_id === item.sku_id);
        }
        
        return {
          cartItemID: item.cartItemID,
          productID: item.productID,
          sku_id: item.sku_id,
          quantity: item.quantity,
          subtotal: item.subtotal,
          product: {
            id: product.id,
            name: product.name,
            image: product.image,
            price: skuInfo ? skuInfo.price : product.new_price,
            isConfigurable: product.isConfigurable || false
          },
          skuInfo: skuInfo ? {
            configurable_values: skuInfo.configurable_values,
            image_url: skuInfo.image_url,
            inventory_status: skuInfo.inventory_status
          } : null
        };
      })
    );
    
    // 过滤掉空值
    const filteredCart = enhancedCart.filter(item => item !== null);
    
    // 计算总计
    const cartTotal = filteredCart.reduce((total, item) => total + item.subtotal, 0);
    
    res.json({
      success: true,
      cart: filteredCart,
      cartCount: filteredCart.length,
      cartTotal: cartTotal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 更新购物车项数量
router.post('/update', fetchuser, async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const userId = req.user.userID;
    
    if (!cartItemId || quantity === undefined) {
      return res.status(400).json({ success: false, error: "Missing cartItemId or quantity" });
    }
    
    // 查找购物车项
    const cartItem = await CartItem.findOne({ 
      cartItemID: cartItemId,
      userID: userId
    });
    
    if (!cartItem) {
      return res.status(404).json({ success: false, error: "Cart item not found" });
    }
    
    // 查找产品以获取最新价格
    const product = await Product.findOne({ id: cartItem.productID });
    let productPrice = 0;
    
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    // 确定价格
    if (cartItem.sku_id && product.isConfigurable) {
      const sku = product.skus.find(s => s.sku_id === cartItem.sku_id);
      if (sku) {
        productPrice = sku.price;
      } else {
        productPrice = product.new_price;
      }
    } else {
      productPrice = product.new_price;
    }
    
    if (quantity <= 0) {
      // 删除购物车项
      await CartItem.deleteOne({ _id: cartItem._id });
      return res.json({ success: true, message: "Cart item removed" });
    } else {
      // 更新数量和小计
      cartItem.quantity = quantity;
      cartItem.subtotal = quantity * productPrice;
      await cartItem.save();
      
      return res.json({ 
        success: true, 
        message: "Cart item updated",
        cartItem: cartItem
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 清空购物车
router.post('/clear', fetchuser, async (req, res) => {
  try {
    const userId = req.user.userID;
    
    // 删除该用户的所有购物车项
    await CartItem.deleteMany({ userID: userId });
    
    res.json({ 
      success: true, 
      message: "Cart cleared"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

module.exports = router;