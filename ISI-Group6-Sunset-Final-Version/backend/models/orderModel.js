import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    orderId: { type: Number, unique: true },
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true , default: false },
    date: {type: Number, required:true},
    statusChangeDate: { type: Date }
}, { timestamps: true })

// 添加自增中间件
orderSchema.pre('save', async function(next) {
    if (!this.isNew) {
        return next();
    }
    
    try {
        const lastOrder = await this.constructor.findOne().sort({ orderId: -1 });
        this.orderId = lastOrder && lastOrder.orderId ? lastOrder.orderId + 1 : 1;
        console.log("创建新订单，订单ID:", this.orderId);
        next();
    } catch (error) {
        console.error("生成订单ID出错:", error);
        next(error);
    }
});

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)
export default orderModel;