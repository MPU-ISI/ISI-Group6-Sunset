// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");
const SKU = require("../models/SKUs");
const fetchuser = require("../middleware/auth");
const { generateSequentialId } = require('../utils/idGenerator');

// 创建新订单 (从购物车)
router.post('/create', fetchuser, async (req, res) => {
  try {
    const { address } = req.body;
    const userID = req.user.userID;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    // 获取购物车
    const cartItems = await CartItem.find({ userID });
    
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create order with empty cart'
      });
    }
    
    // 准备订单项
    const orderItems = [];
    let totalAmount = 0;
    
    // 检查订单类型 (所有产品是虚拟产品还是实体产品)
    let hasVirtual = false;
    let hasTangible = false;
    
    for (const cartItem of cartItems) {
      // 获取产品信息
      const product = await Product.findOne({ productID: cartItem.productID });
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${cartItem.productID} not found`
        });
      }
      
      // 检查产品类型 (假设Product模型有productType字段)
      const productType = product.productType || 'tangible';
      if (productType === 'virtual') hasVirtual = true;
      if (productType === 'tangible') hasTangible = true;
      
      // 确定价格
      let price = product.new_price;
      
      if (cartItem.sku_id) {
        const sku = await SKU.findOne({ sku_id: cartItem.sku_id });
        if (sku && sku.price) {
          price = sku.price;
        }
      }
      
      // 创建订单项
      const orderItem = {
        productID: cartItem.productID,
        productName: product.name,
        productType,
        sku_id: cartItem.sku_id,
        quantity: cartItem.quantity,
        price
      };
      
      orderItems.push(orderItem);
      totalAmount += price * cartItem.quantity;
    }
    
    // 不允许混合虚拟和实体产品
    if (hasVirtual && hasTangible) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mix virtual and tangible products in the same order'
      });
    }
    
    // 创建订单
    const orderID = await generateSequentialId('Order');
    const orderType = hasVirtual ? 'virtual' : 'tangible';
    
    const order = new Order({
      orderID,
      userID,
      items: orderItems,
      totalAmount,
      orderType,
      statusID: 1, // 待处理 (Pending)
      address,
      statusHistory: [{
        statusID: 1,
        date: new Date(),
        comment: 'Order created'
      }]
    });
    
    await order.save();
    
    // 清空购物车
    await CartItem.deleteMany({ userID });
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// 获取用户订单
router.get('/myorders', fetchuser, async (req, res) => {
  try {
    const userID = req.user.userID;
    const orders = await Order.find({ userID }).sort({ orderDate: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// 获取订单详情
router.get('/detail/:orderID', fetchuser, async (req, res) => {
  try {
    const { orderID } = req.params;
    const userID = req.user.userID;
    
    let order;
    if (req.user.role === 'admin') {
      // 管理员可以查看任何订单
      order = await Order.findOne({ orderID: parseInt(orderID) });
    } else {
      // 普通用户只能查看自己的订单
      order = await Order.findOne({ 
        orderID: parseInt(orderID),
        userID
      });
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// 用户取消订单
router.post('/cancel/:orderID', fetchuser, async (req, res) => {
  try {
    const { orderID } = req.params;
    const { comment } = req.body;
    const userID = req.user.userID;
    
    const order = await Order.findOne({ 
      orderID: parseInt(orderID),
      userID
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // 检查订单类型和当前状态
    const cancelStatusID = 3; // 对于实体产品是"Cancelled"，对于虚拟产品是"Complete"
    
    if (!order.canChangeStatus(cancelStatusID)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${order.statusName} status`
      });
    }
    
    // 更新订单状态
    order.addStatusHistory(cancelStatusID, comment || 'Cancelled by customer');
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// 管理员：获取所有订单
router.get('/admin/all', fetchuser, async (req, res) => {
  try {
    // 验证管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    // 支持筛选
    const { orderType, statusID, fromDate, toDate } = req.query;
    const filter = {};
    
    if (orderType) filter.orderType = orderType;
    if (statusID) filter.statusID = parseInt(statusID);
    
    if (fromDate || toDate) {
      filter.orderDate = {};
      if (fromDate) filter.orderDate.$gte = new Date(fromDate);
      if (toDate) filter.orderDate.$lte = new Date(toDate);
    }
    
    const orders = await Order.find(filter).sort({ orderDate: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// 管理员：更新订单状态
router.put('/admin/status/:orderID', fetchuser, async (req, res) => {
  try {
    // 验证管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { orderID } = req.params;
    const { statusID, comment, trackingNumber, ticketInfo } = req.body;
    
    if (!statusID) {
      return res.status(400).json({
        success: false,
        message: 'Status ID is required'
      });
    }
    
    const order = await Order.findOne({ orderID: parseInt(orderID) });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // 检查状态变更是否有效
    if (!order.canChangeStatus(parseInt(statusID))) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.statusName} to status ID ${statusID}`
      });
    }
    
    // 更新订单状态
    order.addStatusHistory(parseInt(statusID), comment || '');
    
    // 特殊处理：如果发货，更新跟踪号
    if (order.orderType === 'tangible' && parseInt(statusID) === 2 && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    // 特殊处理：如果是发放电子票据，更新票据信息
    if (order.orderType === 'virtual' && parseInt(statusID) === 2 && ticketInfo) {
      order.ticketInfo = ticketInfo;
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// 获取订单状态列表
router.get('/statuses', async (req, res) => {
  try {
    const { orderType = 'tangible' } = req.query;
    
    const tangibleStatuses = [
      { statusID: 1, statusName: 'Pending', description: 'Order has been placed' },
      { statusID: 2, statusName: 'Shipped', description: 'Order has been shipped' },
      { statusID: 3, statusName: 'Cancelled', description: 'Order has been cancelled' },
      { statusID: 4, statusName: 'Hold', description: 'Order is on hold' }
    ];
    
    const virtualStatuses = [
      { statusID: 1, statusName: 'Pending', description: 'Order has been placed' },
      { statusID: 2, statusName: 'Ticket-Issued', description: 'E-tickets have been issued' },
      { statusID: 3, statusName: 'Complete', description: 'Tickets have been used or expired' },
      { statusID: 4, statusName: 'Refunded', description: 'Order has been refunded' }
    ];
    
    res.status(200).json({
      success: true,
      statuses: orderType === 'virtual' ? virtualStatuses : tangibleStatuses
    });
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statuses',
      error: error.message
    });
  }
});

module.exports = router;