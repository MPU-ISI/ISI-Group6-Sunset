import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    products: [{ 
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'product',
            required: true 
        },
        size: {
            type: String,
            required: true
        },
        addedAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    created: { 
        type: Date, 
        default: Date.now 
    }
});

// 不使用唯一索引，而是在代码中处理重复产品
// wishlistSchema.index({ userId: 1, "products.productId": 1 }, { unique: true });

const wishlistModel = mongoose.models.wishlist || mongoose.model('wishlist', wishlistSchema);

export default wishlistModel; 