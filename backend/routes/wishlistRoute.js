import express from 'express';
import authUser from '../middleware/auth.js';
import {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistItem
} from '../controllers/wishlistController.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authUser);

// 获取用户的愿望单
router.post('/get', getUserWishlist);

// 添加商品到愿望单
router.post('/add', addToWishlist);

// 从愿望单移除商品
router.post('/remove', removeFromWishlist);

// 清空愿望单
router.post('/clear', clearWishlist);

// 检查商品是否在愿望单中
router.get('/check/:productId', checkWishlistItem);

export default router; 