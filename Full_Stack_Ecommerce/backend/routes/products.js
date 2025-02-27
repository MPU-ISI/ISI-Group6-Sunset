const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const ProductAttribute = require("../models/ProductAttribute");
const ProductOption = require("../models/ProductOption");
const SKU = require("../models/SKUs");

// Get all products
router.get("/all", async (req, res) => {
  try {
    let products = await Product.find({});
    console.log("All Products");
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get product with all related data
router.get("/detail/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id })
      .populate('attributes')
      .populate('options')
      .populate('skus');
    
    if (!product) {
      return res.status(404).json({ success: false, errors: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get new collections - 保持不变
router.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.find({});
    let arr = products.slice(0).slice(-8);
    console.log("New Collections");
    res.send(arr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get popular in women - 保持不变
router.get("/popularinwomen", async (req, res) => {
  try {
    let products = await Product.find({ category: "women" });
    let arr = products.splice(0, 4);
    console.log("Popular In Women");
    res.send(arr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get related products - 保持不变
router.post("/related", async (req, res) => {
  try {
    console.log("Related Products");
    const { category } = req.body;
    const products = await Product.find({ category });
    const arr = products.slice(0, 4);
    res.send(arr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Add product - 修改以支持关联模型
router.post("/add", async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. 生成新的产品ID
      let products = await Product.find({}).session(session);
      let id;
      if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
      } else { 
        id = 1; 
      }
      
      // 2. 创建基础产品
      const productData = {
        id: id,
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        isConfigurable: req.body.isConfigurable || false,
        productType: req.body.isConfigurable ? 'configurable' : 'simple',
        categoryID: req.body.categoryID
      };
      
      const product = new Product(productData);
      await product.save({ session });
      
      // 3. 如果是可配置产品，创建并关联相关模型
      if (req.body.isConfigurable) {
        // 处理属性
        if (req.body.attributes && req.body.attributes.length > 0) {
          const attributesPromises = req.body.attributes.map(async (attr, index) => {
            const attribute = new ProductAttribute({
              attributeID: index + 1,
              productID: id,
              attributeName: attr.attributeName,
              details: attr.details,
              product: product._id
            });
            await attribute.save({ session });
            return attribute._id;
          });
          
          const attributeIds = await Promise.all(attributesPromises);
          product.attributes = attributeIds;
        }
        
        // 处理选项
        if (req.body.options && req.body.options.length > 0) {
          const optionsPromises = req.body.options.map(async (opt, index) => {
            const option = new ProductOption({
              option_id: index + 1,
              product_id: id,
              option_name: opt.option_name,
              values: opt.values,
              product: product._id
            });
            await option.save({ session });
            return option._id;
          });
          
          const optionIds = await Promise.all(optionsPromises);
          product.options = optionIds;
        }
        
        // 处理SKUs
        if (req.body.skus && req.body.skus.length > 0) {
          const skusPromises = req.body.skus.map(async (skuItem, index) => {
            const sku = new SKU({
              sku_id: index + 1,
              product_id: id,
              configurable_values: skuItem.configurable_values,
              sku_code: skuItem.sku_code,
              inventory_status: skuItem.inventory_status || "in_stock",
              quantity: skuItem.quantity || 0,
              price: skuItem.price,
              image_url: skuItem.image_url || req.body.image,
              product: product._id
            });
            await sku.save({ session });
            return sku._id;
          });
          
          const skuIds = await Promise.all(skusPromises);
          product.skus = skuIds;
        }
        
        // 更新产品以保存关联
        await product.save({ session });
      }
      
      await session.commitTransaction();
      console.log("Product Added");
      res.json({ success: true, name: req.body.name, id: id });
      
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      throw error; // 重新抛出错误以被外部 catch 捕获
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Remove product - 修改以删除关联数据
router.post("/remove", async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const product = await Product.findOne({ id: req.body.id }).session(session);
      
      if (!product) {
        return res.status(404).json({ success: false, errors: "Product not found" });
      }
      
      // 删除关联的属性
      if (product.attributes && product.attributes.length > 0) {
        await ProductAttribute.deleteMany({ 
          _id: { $in: product.attributes } 
        }).session(session);
      }
      
      // 删除关联的选项
      if (product.options && product.options.length > 0) {
        await ProductOption.deleteMany({ 
          _id: { $in: product.options } 
        }).session(session);
      }
      
      // 删除关联的SKUs
      if (product.skus && product.skus.length > 0) {
        await SKU.deleteMany({ 
          _id: { $in: product.skus } 
        }).session(session);
      }
      
      // 删除产品本身
      await Product.deleteOne({ id: req.body.id }).session(session);
      
      await session.commitTransaction();
      console.log("Product Removed");
      res.json({ success: true, name: req.body.name });
      
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// 在文件顶部添加以下引用
const mongoose = require("mongoose");

module.exports = router;