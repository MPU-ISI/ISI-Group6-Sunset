import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET,
})

// 处理下单时的库存更新
const updateStockOnOrder = async (items) => {
    try {
        for (const item of items) {
            if (item._id && item.size && item.quantity) {
                const product = await productModel.findById(item._id);
                if (product && product.sizes) {
                    const currentStock = product.sizes.get(item.size) || 0;
                    if (currentStock >= item.quantity) {
                        product.sizes.set(item.size, currentStock - item.quantity);
                        await product.save();
                    }
                }
            }
        }
    } catch (error) {
        console.log("更新库存出错:", error);
        throw error;
    }
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;

        // 检查所有商品库存是否充足
        for (const item of items) {
            if (item._id && item.size && item.quantity) {
                const product = await productModel.findById(item._id);
                if (!product || !product.sizes) {
                    return res.json({success: false, message: `商品 ${item.name} 不存在`});
                }
                
                const stock = product.sizes.get(item.size) || 0;
                if (stock < item.quantity) {
                    return res.json({
                        success: false, 
                        message: `商品 ${item.name} 尺码 ${item.size} 库存不足，当前库存: ${stock}, 需要: ${item.quantity}`
                    });
                }
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // 更新库存
        await updateStockOnOrder(items);

        await userModel.findByIdAndUpdate(userId,{cartData:{}});

        res.json({success:true,message:"Order Placed"});


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;

        // 检查所有商品库存是否充足
        for (const item of items) {
            if (item._id && item.size && item.quantity) {
                const product = await productModel.findById(item._id);
                if (!product || !product.sizes) {
                    return res.json({success: false, message: `商品 ${item.name} 不存在`});
                }
                
                const stock = product.sizes.get(item.size) || 0;
                if (stock < item.quantity) {
                    return res.json({
                        success: false, 
                        message: `商品 ${item.name} 尺码 ${item.size} 库存不足，当前库存: ${stock}, 需要: ${item.quantity}`
                    });
                }
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            const order = await orderModel.findById(orderId);
            if (order) {
                await updateStockOnOrder(order.items);
                await orderModel.findByIdAndUpdate(orderId, {payment:true});
                await userModel.findByIdAndUpdate(userId, {cartData: {}});
                res.json({success: true});
            } else {
                res.json({success: false, message: "订单不存在"});
            }
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body

        // 检查所有商品库存是否充足
        for (const item of items) {
            if (item._id && item.size && item.quantity) {
                const product = await productModel.findById(item._id);
                if (!product || !product.sizes) {
                    return res.json({success: false, message: `商品 ${item.name} 不存在`});
                }
                
                const stock = product.sizes.get(item.size) || 0;
                if (stock < item.quantity) {
                    return res.json({
                        success: false, 
                        message: `商品 ${item.name} 尺码 ${item.size} 库存不足，当前库存: ${stock}, 需要: ${item.quantity}`
                    });
                }
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // 支付成功后在verification中更新库存

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error,order)=>{
            if (error) {
                console.log(error)
                return res.json({success:false, message: error})
            }
            res.json({success:true,order})
        })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Razorpay
const verifyRazorpay = async (req,res) => {
    try {
        
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body
        
        const order = await orderModel.findOne({_id:req.body.receipt})
        
        // update order
        await orderModel.findOneAndUpdate({_id:req.body.receipt},{
            'payment': true,
            'paymentDetails.razorpay_order_id': razorpay_order_id,
            'paymentDetails.razorpay_payment_id': razorpay_payment_id,
            'paymentDetails.razorpay_signature': razorpay_signature
        })

        // 更新库存
        if(order) {
            await updateStockOnOrder(order.items);
            await userModel.findByIdAndUpdate(order.userId, {cartData: {}});
        }

        res.json({success:true})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({}).sort({ date: -1 })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId }).sort({ date: -1 })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    const { orderId, status, statusChangeDate } = req.body;

    try {
        await orderModel.findByIdAndUpdate(orderId, {
            status,
            statusChangeDate
        });
        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 获取单个订单详情
const getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // 查找订单
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "订单不存在" });
        }
        
        res.json({ success: true, order });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, getOrderDetail}