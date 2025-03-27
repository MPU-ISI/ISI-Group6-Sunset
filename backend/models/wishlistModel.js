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

const wishlistModel = mongoose.models.wishlist || mongoose.model('wishlist', wishlistSchema);

export default wishlistModel; 