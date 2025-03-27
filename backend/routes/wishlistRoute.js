import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, checkInWishlist } from '../controllers/wishlistController.js';
import authUser from '../middleware/auth.js';

const wishlistRouter = express.Router();

// 所有 wishlist 路由都需要用户认证
wishlistRouter.use(authUser);

// Wishlist 路由
wishlistRouter.get('/get', getWishlist);
wishlistRouter.post('/add', addToWishlist);
wishlistRouter.post('/remove', removeFromWishlist);
wishlistRouter.post('/clear', clearWishlist);
wishlistRouter.get('/check/:productId', checkInWishlist);

export default wishlistRouter; 