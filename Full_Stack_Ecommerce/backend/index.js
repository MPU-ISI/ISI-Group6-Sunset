const express = require("express");
const cors = require("cors");
const path = require("path");
require("./config/db"); // Database connection

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/images', express.static('upload/images'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/upload", require("./routes/upload"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});