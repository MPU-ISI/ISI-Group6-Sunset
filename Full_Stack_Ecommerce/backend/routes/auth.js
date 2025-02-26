const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Users = require("../models/User");

// Login route
router.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  
  try {
    // 修改为使用 email 或 userName 登录
    const { email, userName, password } = req.body;
    
    let user;
    if (email) {
      user = await Users.findOne({ email });
    } else if (userName) {
      user = await Users.findOne({ userName });
    } else {
      return res.status(400).json({ success, errors: "请提供电子邮箱或用户名" });
    }
    
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = {
          user: {
            id: user._id,
            userID: user.userID
          }
        }
        success = true;
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ 
          success, 
          token,
          user: {
            userID: user.userID,
            userName: user.userName,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      } else {
        return res.status(400).json({ success, errors: "请使用正确的密码" })
      }
    } else {
      return res.status(400).json({ success, errors: "用户不存在" })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "服务器错误" });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  
  try {
    const { userName, email, password, firstName, lastName, address } = req.body;
    
    // 检查邮箱是否已存在
    let emailCheck = await Users.findOne({ email });
    if (emailCheck) {
      return res.status(400).json({ success, errors: "该邮箱已被注册" });
    }
    
    // 检查用户名是否已存在
    let userNameCheck = await Users.findOne({ userName });
    if (userNameCheck) {
      return res.status(400).json({ success, errors: "该用户名已被使用" });
    }
    
    // 获取最新的 userID
    const lastUser = await Users.findOne().sort({ userID: -1 });
    const userID = lastUser ? lastUser.userID + 1 : 1;
    
    // 创建新用户
    const user = new Users({
      userID,
      userName,
      password, // 注意：生产环境中应该对密码进行加密
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      address: address || ""
    });
    
    await user.save();
    
    const data = {
      user: {
        id: user._id,
        userID: user.userID
      }
    }

    const token = jwt.sign(data, 'secret_ecom');
    success = true;
    res.json({ 
      success, 
      token,
      user: {
        userID: user.userID,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "服务器错误" });
  }
});

// 获取用户信息路由
router.get('/user', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "服务器错误" });
  }
});

module.exports = router;