require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 重新创建 SQLite 数据库
const db = new sqlite3.Database("./users.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Error opening database: ", err.message);
    } else {
        console.log("✅ Connected to the new SQLite database.");
    }
});

// 重新创建 users 表（使用 firstName 和 lastName）
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        shippingAddress TEXT NOT NULL
    )
`);

// 用户注册
app.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, shippingAddress } = req.body;
    if (!firstName || !lastName || !email || !password || !shippingAddress) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        "INSERT INTO users (firstName, lastName, email, password, shippingAddress) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword, shippingAddress],
        (err) => {
            if (err) return res.status(400).json({ error: "Email already exists" });
            res.status(201).json({ message: "User registered successfully" });
        }
    );
});

// 用户登录
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user.id, firstName: user.firstName, lastName: user.lastName }, "secretkey", { expiresIn: "1h" });
        res.json({ token, firstName: user.firstName, lastName: user.lastName });
    });
});

// 启动服务器
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
