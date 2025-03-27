import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password, shippingAddress } = req.body;
        
        console.log("Registration request received:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Password:", password ? "password provided" : "no password");
        console.log("Shipping Address:", shippingAddress);

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            shippingAddress: shippingAddress || {}
        })
        
        console.log("Creating new user with data:", {
            name,
            email,
            shippingAddress: shippingAddress || {}
        });

        const user = await newUser.save()
        console.log("User saved successfully:", user._id);

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Get user info route
const getUserInfo = async (req, res) => {
    try {
        console.log("Getting user info with ID:", req.body.userId);
        
        if (!req.body.userId) {
            return res.json({ success: false, message: "User ID not found in request" });
        }
        
        const user = await userModel.findById(req.body.userId).select('-password');
        
        if (!user) {
            console.log("User not found in database");
            return res.json({ success: false, message: "User not found" });
        }
        
        console.log("User found:", user._id);
        console.log("Shipping address:", user.shippingAddress);
        
        res.json({ success: true, user });
    } catch (error) {
        console.log("Error in getUserInfo:", error);
        res.json({ success: false, message: error.message });
    }
}

// Test auth and shipping address
const testAuth = async (req, res) => {
    try {
        console.log("Test auth endpoint called");
        console.log("Request userId:", req.body.userId);
        
        if (!req.body.userId) {
            return res.json({ 
                success: false, 
                message: "Authentication failed", 
                debug: { 
                    userId: req.body.userId, 
                    headers: req.headers 
                }
            });
        }
        
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.json({ 
                success: false, 
                message: "User not found", 
                userId: req.body.userId 
            });
        }
        
        return res.json({
            success: true,
            message: "Authentication successful",
            userId: user._id,
            name: user.name,
            hasShippingAddress: !!user.shippingAddress,
            shippingAddressData: user.shippingAddress
        });
    } catch (error) {
        console.log("Error in test auth:", error);
        return res.json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
}

export { loginUser, registerUser, adminLogin, getUserInfo, testAuth }