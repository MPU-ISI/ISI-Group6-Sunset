import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import orderModel from '../models/orderModel.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

// Payment Features
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders',authUser,userOrders)

// verify payment
orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)

// 添加这个路由来迁移现有订单，添加订单ID
orderRouter.post('/migrateOrderIds', async (req, res) => {
    try {
        // 找到所有没有orderId的订单
        const ordersWithoutId = await orderModel.find({ orderId: { $exists: false } });
        
        console.log(`找到 ${ordersWithoutId.length} 个没有订单ID的订单`);
        
        // 找到最大的orderId
        const lastOrder = await orderModel.findOne().sort({ orderId: -1 });
        let nextOrderId = lastOrder && lastOrder.orderId ? lastOrder.orderId + 1 : 1;
        
        // 给每个订单分配一个新的orderId
        for (const order of ordersWithoutId) {
            order.orderId = nextOrderId++;
            await order.save();
        }
        
        res.json({ 
            success: true, 
            message: `成功为 ${ordersWithoutId.length} 个订单添加了订单ID`
        });
    } catch (error) {
        console.error("迁移订单ID出错:", error);
        res.json({ success: false, message: error.message });
    }
});

export default orderRouter