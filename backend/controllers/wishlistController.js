import wishlistModel from "../models/wishlistModel.js";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

// 获取用户的 wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // 查找用户的 wishlist 并填充产品详情
        let wishlist = await wishlistModel.findOne({ userId }).populate('products.productId');
        
        if (!wishlist) {
            return res.json({ 
                success: true, 
                wishlist: { 
                    products: [] 
                } 
            });
        }
        
        // 转换数据结构以匹配前端期望的格式
        const formattedWishlist = {
            ...wishlist.toObject(),
            products: wishlist.products.map(item => ({
                _id: item.productId._id,
                size: item.size,
                addedAt: item.addedAt,
                details: {
                    ...item.productId._doc,
                    size: item.size
                }
            }))
        };
        
        return res.json({ 
            success: true, 
            wishlist: formattedWishlist 
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 添加产品到 wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId, size } = req.body;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        if (!size) {
            return res.json({ success: false, message: "Size is required" });
        }
        
        // 检查产品是否存在
        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        // 查找或创建 wishlist
        let wishlist = await wishlistModel.findOne({ userId });
        
        if (!wishlist) {
            wishlist = new wishlistModel({
                userId,
                products: []
            });
        }
        
        // 检查相同产品和尺码是否已在 wishlist 中
        const productSizeExists = wishlist.products.some(item => 
            item.productId.toString() === productId && item.size === size
        );
        
        if (productSizeExists) {
            return res.json({ 
                success: true, 
                message: "This product with selected size is already in your wishlist" 
            });
        }
        
        // 添加产品到 wishlist
        wishlist.products.push({
            productId,
            size,
            addedAt: new Date()
        });
        
        await wishlist.save();
        
        return res.json({ 
            success: true, 
            message: "Product added to wishlist" 
        });
        
    } catch (error) {
        console.log('添加到愿望单错误:', error);
        res.json({ success: false, message: error.message });
    }
};

// 从 wishlist 移除产品
const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        // 首先尝试使用 MongoDB 的 ObjectId 来移除产品
        try {
            // 将字符串 ID 转换为 ObjectId
            const objectId = new mongoose.Types.ObjectId(productId);
            
            // 尝试按 MongoDB _id 删除
            const result = await wishlistModel.updateOne(
                { userId },
                { $pull: { products: { _id: objectId } } }
            );
            
            if (result.modifiedCount > 0) {
                return res.json({ 
                    success: true, 
                    message: "Product removed from wishlist" 
                });
            }
        } catch (idError) {
            console.log("ID conversion error:", idError);
            // 如果 ID 转换失败，继续尝试其他方法
        }
        
        // 如果按 _id 删除失败，尝试按 productId 删除
        const resultByProductId = await wishlistModel.updateOne(
            { userId },
            { $pull: { products: { productId: productId } } }
        );
        
        if (resultByProductId.modifiedCount > 0) {
            return res.json({ 
                success: true, 
                message: "Product removed from wishlist" 
            });
        }
        
        return res.json({ 
            success: false, 
            message: "Product not found in wishlist" 
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 清空 wishlist
const clearWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        
        await wishlistModel.updateOne(
            { userId },
            { $set: { products: [] } }
        );
        
        return res.json({ 
            success: true, 
            message: "Wishlist cleared" 
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 检查产品是否在 wishlist 中
const checkInWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const { productId } = req.params;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        const wishlist = await wishlistModel.findOne({
            userId,
            "products.productId": productId
        });
        
        return res.json({ 
            success: true, 
            inWishlist: !!wishlist 
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, checkInWishlist }; 