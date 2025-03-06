const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product"); 
const fetchuser = require("../middleware/auth");
const { generateSequentialId } = require('../utils/idGenerator');
const SKU = require("../models/SKUs");

/**
 * 购物车相关路由
 */

// 添加商品到购物车
router.post('/add', fetchuser, async (req, res) => {
  try {
    const { productID, quantity = 1, sku_id = null } = req.body;
    // 使用userID而不是id
    const userID = req.user.userID;
    console.log("Adding to cart for user ID:", userID);

    if (!productID || !quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID or quantity' 
      });
    }

    // 验证产品存在,数字和字符串转换问题
    console.log(productID);
    const products = await Product.find({}).select('productID');
    const products2 = await Product.find({}).select('id');
    console.log(products2);
    console.log(products);
    const product = await Product.findOne({ productID });
    console.log(product);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // 检查价格和SKU
    let price = product.new_price;
    
    // 如果提供了SKU ID，验证并获取价格
    if (sku_id && product.isConfigurable) {
      const sku = await SKU.findOne({ sku_id, product_id: productID });
      if (!sku) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SKU for this product'
        });
      }
      
      // 如果SKU有特定价格，使用该价格
      if (sku.price) {
        price = sku.price;
      }
    } else if (product.isConfigurable && !sku_id) {
      // 如果是可配置产品但未提供SKU ID
      return res.status(400).json({
        success: false,
        message: 'SKU ID is required for configurable products'
      });
    }

    // 检查是否已存在相同产品和SKU的购物车项
    let cartItem = await CartItem.findOne({ 
      userID, 
      productID,
      sku_id: sku_id || { $exists: false }
    });

    if (cartItem) {
      // 更新已有的购物车项
      cartItem.quantity += quantity;
      cartItem.subtotal = cartItem.quantity * price;
      await cartItem.save();
    } else {
      // 创建新的购物车项
      const cartItemID = await generateSequentialId('CartItem');
      
      cartItem = new CartItem({
        cartItemID,
        userID,
        productID,
        sku_id: sku_id || undefined,
        quantity,
        subtotal: quantity * price
      });
      
      await cartItem.save();
    }

    // 获取更新后的购物车
    const cartItems = await CartItem.find({ userID });
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cartItem,
      cart: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
});

// 更新购物车中的商品
router.put('/update', fetchuser, async (req, res) => {
  try {
    const { cartItemID, quantity } = req.body;
    // 使用userID而不是id
    const userID = req.user.userID;

    if (!cartItemID || quantity === undefined || quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid cart item ID or quantity' 
      });
    }

    // 查找购物车项
    const cartItem = await CartItem.findOne({ cartItemID, userID });
    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    // 获取产品价格
    const product = await Product.findOne({ productID: cartItem.productID });
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product no longer exists' 
      });
    }

    // 确定价格（包括SKU价格）
    let price = product.new_price;
    if (cartItem.sku_id) {
      const sku = await SKU.findOne({ sku_id: cartItem.sku_id, product_id: cartItem.productID });
      if (sku && sku.price) {
        price = sku.price;
      }
    }

    // 更新购物车项
    if (quantity === 0) {
      // 如果数量为0，则删除该项
      await CartItem.deleteOne({ cartItemID });
    } else {
      // 更新数量和小计
      cartItem.quantity = quantity;
      cartItem.subtotal = quantity * price;
      await cartItem.save();
    }

    // 获取更新后的购物车
    const cartItems = await CartItem.find({ userID });
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      message: quantity > 0 ? 'Cart item updated successfully' : 'Cart item removed successfully',
      cart: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
});

// 从购物车中移除商品
router.delete('/remove/:cartItemID', fetchuser, async (req, res) => {
  try {
    const { cartItemID } = req.params;
    // 使用userID而不是id
    const userID = req.user.userID;

    if (!cartItemID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid cart item ID' 
      });
    }

    // 删除购物车项
    const result = await CartItem.deleteOne({ 
      cartItemID: parseInt(cartItemID), 
      userID 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found or already removed' 
      });
    }

    // 获取更新后的购物车
    const cartItems = await CartItem.find({ userID });
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
});

// 获取用户购物车
router.get('/', fetchuser, async (req, res) => {
  try {
    // 使用userID而不是id
    const userID = req.user.userID;
    console.log("Getting cart for user ID:", userID);

    // 获取购物车项
    const cartItems = await CartItem.find({ userID });
    
    // 获取对应的产品详情和SKU详情
    const enrichedCart = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findOne({ productID: item.productID });
      
      if (!product) {
        // 处理产品不存在的情况
        return {
          ...item.toObject(),
          productDetails: null,
          skuDetails: null,
          isValid: false
        };
      }
      
      // 获取SKU详情
      let skuDetails = null;
      if (item.sku_id) {
        const sku = await SKU.findOne({ sku_id: item.sku_id, product_id: item.productID });
        if (sku) {
          skuDetails = sku.toObject();
        }
      }
      
      return {
        ...item.toObject(),
        productDetails: {
          name: product.name,
          image: product.image,
          price: product.new_price,
          category: product.category,
          isConfigurable: product.isConfigurable
        },
        skuDetails,
        isValid: true
      };
    }));
    
    // 计算总价
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      cart: {
        items: enrichedCart,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// 清空购物车
router.delete('/clear', fetchuser, async (req, res) => {
  try {
    // 使用userID而不是id
    const userID = req.user.userID;

    // 删除该用户的所有购物车项
    const result = await CartItem.deleteMany({ userID });

    res.status(200).json({
      success: true,
      message: `Cart cleared successfully. Removed ${result.deletedCount} items.`,
      cart: {
        items: [],
        total: 0
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

// 购物车验证
router.post('/validate', fetchuser, async (req, res) => {
  try {
    // 使用userID而不是id
    const userID = req.user.userID;

    // 获取购物车项
    const cartItems = await CartItem.find({ userID });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }

    // 逐项验证
    const validationResults = [];
    let needsUpdate = false;
    let isValid = true;

    for (const item of cartItems) {
      const product = await Product.findOne({ productID: item.productID });
      
      if (!product) {
        validationResults.push({
          cartItemID: item.cartItemID,
          isValid: false,
          message: 'Product no longer exists'
        });
        isValid = false;
        continue;
      }

      // 获取价格（包括SKU价格）
      let currentPrice = product.new_price;
      
      // 验证SKU
      if (item.sku_id) {
        const sku = await SKU.findOne({ sku_id: item.sku_id, product_id: item.productID });
        
        if (!sku) {
          validationResults.push({
            cartItemID: item.cartItemID,
            isValid: false,
            message: 'Selected product variant no longer exists'
          });
          isValid = false;
          continue;
        }
        
        // 如果SKU有特定价格，使用该价格
        if (sku.price) {
          currentPrice = sku.price;
        }
      }

      // 验证价格变化
      const expectedSubtotal = item.quantity * currentPrice;
      
      if (item.subtotal !== expectedSubtotal) {
        // 更新价格
        const oldSubtotal = item.subtotal;
        item.subtotal = expectedSubtotal;
        await item.save();
        needsUpdate = true;
        
        validationResults.push({
          cartItemID: item.cartItemID,
          isValid: true,
          message: 'Price has been updated',
          oldSubtotal: oldSubtotal,
          newSubtotal: expectedSubtotal
        });
      }
    }

    // 重新计算总价
    const updatedCartItems = needsUpdate ? await CartItem.find({ userID }) : cartItems;
    const total = updatedCartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      isValid,
      validationResults,
      cart: {
        items: updatedCartItems,
        total
      }
    });
  } catch (error) {
    console.error('Error validating cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to validate cart',
      error: error.message
    });
  }
});

// 添加测试路由，便于调试
router.get('/test', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Cart API is working',
    date: new Date().toISOString()
  });
});

module.exports = router;