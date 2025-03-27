import userModel from "../models/userModel.js"

// 获取用户的 wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        // 查找用户的 wishlist 并填充产品详情
        let wishlist = await userModel.findById(userId).select('wishlistData');

        if (!wishlist) {
            // 如果不存在，创建一个新的 wishlist
            wishlist = await userModel.create({
                _id: userId,
                wishlistData: {}
            });
        }

        const formattedWishlist = {
            ...wishlist.toObject(),
            products: Object.entries(wishlist.wishlistData).map(([itemId, sizes]) => ({
                productId: itemId,
                sizes: Object.keys(sizes),
                addedAt: new Date()
            }))
        };

        res.json({
            success: true,
            wishlist: formattedWishlist
        });
    } catch (error) {
        console.error('Error in getWishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist'
        });
    }
};

// 获取用户愿望单数据
const getUserWishlist = async (req,res) => {
    try {
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let wishlistData = await userData.wishlistData;

        res.json({ success: true, wishlistData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// 添加商品到愿望单
const addToWishlist = async (req,res) => {
    try {
        const { userId, itemId } = req.body

        const userData = await userModel.findById(userId)
        let wishlistData = await userData.wishlistData;

        if (wishlistData[itemId]) {
            return res.json({ success: false, message: "Item already in wishlist" })
        }

        wishlistData[itemId] = 1
        await userModel.findByIdAndUpdate(userId, {wishlistData})

        res.json({ success: true, message: "Added To Wishlist" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// 从愿望单移除商品
const removeFromWishlist = async (req,res) => {
    try {
        const { userId, itemId } = req.body

        const userData = await userModel.findById(userId)
        let wishlistData = await userData.wishlistData;

        if (wishlistData[itemId]) {
            delete wishlistData[itemId]
            await userModel.findByIdAndUpdate(userId, {wishlistData})
            res.json({ success: true, message: "Removed from wishlist" })
        } else {
            res.json({ success: false, message: "Item not found in wishlist" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// 清空愿望单
const clearWishlist = async (req,res) => {
    try {
        const { userId } = req.body

        const userData = await userModel.findById(userId)
        await userModel.findByIdAndUpdate(userId, {wishlistData: {}})
        
        res.json({ success: true, message: "Wishlist cleared" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// 检查商品是否在愿望单中
const checkWishlistItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        const userData = await userModel.findById(userId).select('wishlistData');

        if (!userData) {
            return res.json({
                success: true,
                inWishlist: false
            });
        }

        const inWishlist = !!userData.wishlistData[productId];

        res.json({
            success: true,
            inWishlist
        });
    } catch (error) {
        console.error('Error in checkWishlistItem:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking wishlist item'
        });
    }
};

export {
    getWishlist,
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistItem
}; 