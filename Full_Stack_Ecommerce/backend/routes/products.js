// routes/products.js
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const CartItem = require('../models/CartItem');
const ProductAttribute = require("../models/ProductAttribute");
const ProductOption = require("../models/ProductOption");
const SKU = require("../models/SKUs");
const Image = require("../models/Images");
const OptionValues = require("../models/OptionValues");


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
// 修改你的产品详情API路由
router.get("/detail/:id", async (req, res) => {
  try {
    // 获取产品基本信息
    let product = await Product.findOne({ productID: parseInt(req.params.id) })
      .populate('attributes')
      .populate('options')
      .populate('skus');
    
    if (!product) {
      // 兼容旧数据，尝试使用id查找
      product = await Product.findOne({ id: parseInt(req.params.id) })
        .populate('attributes')
        .populate('options')
        .populate('skus');
    }
    
    if (!product) {
      return res.status(404).json({ success: false, errors: "Product not found" });
    }
    
    // 产品存在，现在获取每个选项的值
    if (product.options && product.options.length > 0) {
      // 将产品转换为JSON以便于操作
      const productObj = product.toObject();
      
      // 创建一个promises数组来并行处理所有选项的值获取
      const optionPromises = productObj.options.map(async (option) => {
        // 查找该选项的所有值
        const optionValues = await mongoose.model('OptionValues').find({ 
          option_id: option.option_id 
        });
        
        // 将值数组添加到选项对象
        return {
          ...option,
          values: optionValues.map(val => val.value_name)
        };
      });
      
      // 等待所有选项值获取完成
      productObj.options = await Promise.all(optionPromises);
      
      // 返回含有完整选项和值的产品
      return res.json(productObj);
    }
    
    // 如果没有选项，直接返回产品
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get new collections
router.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.find({}).sort({ date: -1 }).limit(8);
    console.log("New Collections");
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get popular in women
router.get("/popularinwomen", async (req, res) => {
  try {
    let products = await Product.find({ category: "women" }).limit(4);
    console.log("Popular In Women");
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Get related products
router.post("/related", async (req, res) => {
  try {
    console.log("Related Products");
    const { category } = req.body;
    const products = await Product.find({ category }).limit(4);
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});


// Add product - 修改以使用productID
router.post("/add", async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. 生成新的产品ID
      let products = await Product.find({}).sort({productID: -1}).limit(1).session(session);
      let productID;
      if (products.length > 0 && products[0].productID) {
        productID = products[0].productID + 1;
      } else {
        // 检查是否有使用id字段的产品
        let oldProducts = await Product.find({}).sort({id: -1}).limit(1).session(session);
        if (oldProducts.length > 0 && oldProducts[0].id) {
          productID = oldProducts[0].id + 1;
        } else {
          productID = 1;
        }
      }
      
      // 2. 创建基础产品
      const productData = {
        productID: productID, // 使用productID作为主键
        id: productID, // 保留id字段以兼容旧代码
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        additional_images: req.body.additional_images || [],
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        isConfigurable: req.body.isConfigurable || false,
        productType: req.body.isConfigurable ? 'configurable' : 'simple',
        categoryID: req.body.categoryID
      };
      
      const product = new Product(productData);
      await product.save({ session });
      
      // 3. 保存额外图片到Images表
      if (req.body.additional_images && req.body.additional_images.length > 0) {
        const imagePromises = req.body.additional_images.map(async (url, index) => {
          // 获取最后一个图片ID
          let lastImage = await Image.findOne({}).sort({imageID: -1}).session(session);
          let nextImageID = lastImage ? lastImage.imageID + 1 : 1;
          
          const image = new Image({
            imageID: nextImageID + index,
            productID: productID,
            image_url: url
          });
          await image.save({ session });
          return image;
        });
        
        await Promise.all(imagePromises);
      }
      
      // 4. 如果是可配置产品，创建并关联相关模型
      if (req.body.isConfigurable) {
        // 处理属性
        if (req.body.attributes && req.body.attributes.length > 0) {
          const attributesPromises = req.body.attributes.map(async (attr, index) => {
            // 获取最后一个属性ID
            let lastAttribute = await ProductAttribute.findOne({}).sort({attributeID: -1}).session(session);
            let nextAttributeID = lastAttribute ? lastAttribute.attributeID + 1 : 1;
            
            const attribute = new ProductAttribute({
              attributeID: nextAttributeID + index,
              productID: productID,
              attributeName: attr.attributeName,
              details: attr.details
            });
            await attribute.save({ session });
            return attribute._id;
          });
          
          const attributeIds = await Promise.all(attributesPromises);
          product.attributes = attributeIds;
        }
        
        if (req.body.options && req.body.options.length > 0) {
          const optionsPromises = req.body.options.map(async (opt, index) => {
            // 获取最后一个选项ID
            let lastOption = await ProductOption.findOne({}).sort({option_id: -1}).session(session);
            let nextOptionID = lastOption ? lastOption.option_id + 1 : 1;
            
            // 计算选项ID
            const optionId = nextOptionID + index;
            
            // 保存选项
            const option = new ProductOption({
              option_id: optionId,
              product_id: productID,
              option_name: opt.option_name
            });
            await option.save({ session });
            
            // 保存选项值
            if (opt.values && opt.values.length > 0) {
              console.log(`Processing ${opt.values.length} values for option ${opt.option_name}`);
              
              // 获取当前最大值ID (仅作为建议值，不保证唯一)
              let maxValueId = 0;
              try {
                const highestValue = await OptionValues.findOne({})
                  .sort({value_id: -1})
                  .session(session);
                
                maxValueId = highestValue && highestValue.value_id 
                  ? highestValue.value_id 
                  : 0;
              } catch (err) {
                console.warn("Could not determine max value_id:", err);
              }
              
              // 为每个值创建记录
              const valuePromises = opt.values.map(async (valueName, index) => {
                try {
                  // 首先检查是否已存在相同选项和值名称的记录
                  const existingValue = await OptionValues.findOne({
                    option_id: optionId,
                    value_name: valueName
                  }).session(session);
                  
                  // 如果已存在则跳过
                  if (existingValue) {
                    console.log(`Value "${valueName}" already exists for option ${optionId}, skipping`);
                    return existingValue;
                  }
                  
                  // 创建新值
                  const optionValue = new OptionValues({
                    value_id: maxValueId + index + 1, // 仅作为建议值
                    option_id: optionId,
                    value_name: valueName
                  });
                  
                  return await optionValue.save({ session });
                } catch (err) {
                  // 如果是唯一键冲突，尝试使用不同的处理方式
                  if (err.code === 11000) {
                    console.warn(`Conflict saving value "${valueName}". Creating without value_id.`);
                    
                    // 尝试不指定value_id
                    const fallbackValue = new OptionValues({
                      option_id: optionId,
                      value_name: valueName
                    });
                    
                    return await fallbackValue.save({ session });
                  }
                  throw err;
                }
              });
              
              // 等待所有值保存完成
              await Promise.all(valuePromises);
              console.log(`Successfully saved all values for option ${opt.option_name}`);
            }
                        
            return option._id;
          });
          
          const optionIds = await Promise.all(optionsPromises);
          product.options = optionIds;
        }
        
        // 处理SKUs
        if (req.body.skus && req.body.skus.length > 0) {
          const skusPromises = req.body.skus.map(async (skuItem, index) => {
            // 获取最后一个SKU ID
            let lastSKU = await SKU.findOne({}).sort({sku_id: -1}).session(session);
            let nextSkuID = lastSKU ? lastSKU.sku_id + 1 : 1;
            
            // 将configurable_values对象转换为JSON字符串
            const configValues = JSON.stringify(skuItem.configurable_values);
            
            const sku = new SKU({
              sku_id: nextSkuID + index,
              product_id: productID,
              configurable_value_ids: configValues,
              sku_code: skuItem.sku_code,
              inventory_status: skuItem.inventory_status || "in_stock",
              quantity: skuItem.quantity || 0,
              price: skuItem.price,
              image_url: skuItem.image_url || req.body.image
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
      console.log("Product Added", productID);
      res.json({ success: true, name: req.body.name, id: productID });
      
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      res.status(500).json({ success: false, errors: error.message });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Remove product - 修改以支持productID
router.post("/remove", async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 尝试使用productID或id查找产品
      const productId = parseInt(req.body.id);
      let product = await Product.findOne({ 
        $or: [{ productID: productId }, { id: productId }] 
      }).session(session);
      
      if (!product) {
        return res.status(404).json({ success: false, errors: "Product not found" });
      }
      
      // 获取产品ID (使用productID或后备为id)
      const productID = product.productID || product.id;
      
      // 删除关联的图片
      await Image.deleteMany({ productID: productID }).session(session);
      
      // 删除关联的属性
      await ProductAttribute.deleteMany({ productID: productID }).session(session);
      
      // 删除关联的选项和值
      await ProductOption.deleteMany({ product_id: productID }).session(session);
      
      // 删除关联的SKUs
      await SKU.deleteMany({ product_id: productID }).session(session);
      
      // 删除产品本身
      await Product.deleteOne({ 
        $or: [{ productID: productId }, { id: productId }] 
      }).session(session);
      
      await session.commitTransaction();
      console.log("Product Removed", productID);
      res.json({ success: true, name: req.body.name });
      
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      res.status(500).json({ success: false, errors: error.message });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});




// Admin专属路由：获取所有产品的详细信息
router.get("/adminAll", async (req, res) => {
  try {
    // 查询所有产品，包括额外的图片
    let products = await Product.find({})
      .sort({ productID: -1 }) // 按ID倒序排列，新产品在前
      .lean(); // 使用lean()转换为纯JavaScript对象，提高性能
    
    // 对每个产品获取其附加图片
    const productsWithImages = await Promise.all(products.map(async (product) => {
      // 获取产品的附加图片
      const images = await Image.find({ 
        productID: product.productID || product.id 
      }).select('image_url -_id').lean();
      
      // 返回带有附加图片的产品
      return {
        ...product,
        additional_images: images.map(img => img.image_url)
      };
    }));
    
    console.log("Admin - All Products with Images");
    res.json(productsWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// Admin专属路由：获取单个产品的完整详细信息
router.get("/adminDetail/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // 查找产品 - 尝试通过productID或id字段
    const product = await Product.findOne({
      $or: [{ productID: productId }, { id: productId }]
    })
      .populate('attributes')  // 填充属性
      .populate('options')     // 填充选项
      .populate('skus')        // 填充SKU
      .lean();
    
    if (!product) {
      return res.status(404).json({ success: false, errors: "Product not found" });
    }
    
    // 获取产品图片
    const images = await Image.find({
      productID: product.productID || product.id
    }).select('image_url -_id').lean();
    
    // 获取选项值
    const optionsWithValues = await Promise.all((product.options || []).map(async (option) => {
      // 确保我们有option_id
      const optionId = option.option_id;
      
      if (!optionId) {
        console.warn(`Option missing option_id:`, option);
        return option;
      }
      
      // 查询此选项的所有值
      const optionValues = await OptionValues.find({
        option_id: optionId
      }).sort({ value_id: 1 }).lean();
      
      console.log(`Found ${optionValues.length} values for option ${optionId}`);
      
      // 返回带有值的选项
      return {
        ...option,
        values: optionValues.map(val => val.value_name)
      };
    }));
    
    // 处理SKU的configurable_value_ids字段
    const skusWithValues = (product.skus || []).map(sku => {
      // 如果configurable_value_ids是JSON字符串，转换为对象
      let configValues = {};
      try {
        if (sku.configurable_value_ids && typeof sku.configurable_value_ids === 'string') {
          configValues = JSON.parse(sku.configurable_value_ids);
        }
      } catch (e) {
        console.error("Error parsing SKU configurable values:", e);
      }
      
      return {
        ...sku,
        configurable_values: configValues
      };
    });
    
    // 构建完整的响应对象
    const detailedProduct = {
      ...product,
      additional_images: images.map(img => img.image_url),
      options: optionsWithValues,
      skus: skusWithValues
    };
    
    console.log("Admin - Product Detail", productId);
    res.json(detailedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

module.exports = router;