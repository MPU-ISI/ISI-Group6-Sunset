import express from 'express';
import { loginUser, registerUser, adminLogin, getUserInfo, testAuth } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/info', authUser, getUserInfo)
userRouter.get('/test-auth', authUser, testAuth)

export default userRouter;