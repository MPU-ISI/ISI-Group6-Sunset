import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller, isOnPromotion, promotionPrice, promotionStartDate, promotionEndDate } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
            isOnPromotion: isOnPromotion === "true" ? true : false,
            promotionPrice: promotionPrice ? Number(promotionPrice) : null,
            promotionStartDate: promotionStartDate ? new Date(promotionStartDate) : null,
            promotionEndDate: promotionEndDate ? new Date(promotionEndDate) : null
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        const { search, showDisabled } = req.query;
        
        // 自动清理过期促销
        const now = new Date();
        await productModel.updateMany(
            { isOnPromotion: true, promotionEndDate: { $lt: now } },
            { $set: { isOnPromotion: false } }
        );
        
        // 构建查询条件
        const query = {};
        
        // 如果不显示已禁用商品，则添加启用条件
        if (showDisabled !== 'true') {
            query.enabled = true;
        }
        
        // 如果有搜索词，则添加模糊搜索条件
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }, // 名称模糊匹配
                { description: { $regex: search, $options: 'i' } }, // 描述模糊匹配
                { _id: search.length === 24 ? search : null } // 如果长度为24，可能是MongoDB ID
            ];
        }
        
        // 获取所有产品
        const products = await productModel.find(query);
        
        return res.json({
            success: true,
            products
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for updating product stock
const updateProductStock = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;

        if (!productId || !size || quantity === undefined) {
            return res.json({ success: false, message: "Missing required parameters" });
        }

        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        // 确保库存不小于0
        if (quantity < 0) {
            return res.json({ success: false, message: "Stock cannot be negative" });
        }

        // 直接设置新的库存值
        product.sizes.set(size, Number(quantity));
        await product.save();

        res.json({ success: true, message: "Stock updated", newStock: quantity });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// 切换产品启用状态
const toggleProductStatus = async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        // 切换状态
        product.enabled = !product.enabled;
        await product.save();
        
        return res.json({ 
            success: true, 
            message: product.enabled ? "Product is enabled" : "Product is disabled",
            enabled: product.enabled
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 更新产品信息
const updateProduct = async (req, res) => {
    try {
        const { 
            productId, 
            name, 
            description, 
            price, 
            category, 
            subCategory, 
            bestseller,
            isOnPromotion,
            promotionPrice,
            promotionStartDate,
            promotionEndDate
        } = req.body;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        // 更新信息
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = Number(price);
        if (category) product.category = category;
        if (subCategory) product.subCategory = subCategory;
        if (bestseller !== undefined) product.bestseller = bestseller === "true" || bestseller === true;
        
        // 更新促销信息
        if (isOnPromotion !== undefined) product.isOnPromotion = isOnPromotion === "true" || isOnPromotion === true;
        if (promotionPrice !== undefined) product.promotionPrice = promotionPrice ? Number(promotionPrice) : null;
        if (promotionStartDate !== undefined) product.promotionStartDate = promotionStartDate ? new Date(promotionStartDate) : null;
        if (promotionEndDate !== undefined) product.promotionEndDate = promotionEndDate ? new Date(promotionEndDate) : null;
        
        await product.save();
        
        return res.json({ 
            success: true, 
            message: "Product information updated",
            product
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 更新产品图片
const updateProductImages = async (req, res) => {
    try {
        const { productId } = req.body;
        let deleteImageIndices = req.body.deleteImageIndices;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        let currentImages = [...product.image];
        let updatedImages = [...currentImages];
        
        // 处理要删除的图片
        if (deleteImageIndices) {
            try {
                // 尝试将JSON字符串解析为数组
                if (typeof deleteImageIndices === 'string') {
                    deleteImageIndices = JSON.parse(deleteImageIndices);
                }
                
                // 确保deleteImageIndices是数组
                if (!Array.isArray(deleteImageIndices)) {
                    deleteImageIndices = [deleteImageIndices];
                }
                
                if (deleteImageIndices.length > 0) {
                    // 将索引转换为数字并排序（从大到小，以便从后往前删除）
                    const indicesToDelete = deleteImageIndices
                        .map(index => parseInt(index))
                        .filter(index => !isNaN(index))
                        .sort((a, b) => b - a);
                    
                    // 删除指定索引的图片
                    for (const index of indicesToDelete) {
                        if (index >= 0 && index < updatedImages.length) {
                            updatedImages.splice(index, 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Error parsing deleteImageIndices:', error);
                // 解析失败，继续处理，不删除任何图片
            }
        }
        
        // 处理新上传的图片
        const newImages = [];
        if (req.files) {
            // 获取所有上传的图片
            for (const key in req.files) {
                if (req.files[key] && req.files[key][0]) {
                    newImages.push(req.files[key][0]);
                }
            }
            
            // 上传到Cloudinary并获取URL
            if (newImages.length > 0) {
                const newImageUrls = await Promise.all(
                    newImages.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                        return result.secure_url;
                    })
                );
                
                // 合并现有图片和新图片
                updatedImages = [...updatedImages, ...newImageUrls];
            }
        }
        
        // 确保至少有一张图片
        if (updatedImages.length === 0) {
            return res.json({ success: false, message: "Product must have at least one image" });
        }
        
        // 更新产品图片
        product.image = updatedImages;
        await product.save();
        
        return res.json({ 
            success: true, 
            message: "Product images updated successfully",
            images: updatedImages
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 管理产品促销状态
const managePromotion = async (req, res) => {
    try {
        const { productId, isOnPromotion, promotionPrice, promotionStartDate, promotionEndDate } = req.body;
        
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        // 更新促销信息
        if (isOnPromotion !== undefined) {
            product.isOnPromotion = isOnPromotion === "true" || isOnPromotion === true;
        }
        
        if (promotionPrice !== undefined) {
            product.promotionPrice = promotionPrice ? Number(promotionPrice) : null;
        }
        
        if (promotionStartDate !== undefined) {
            product.promotionStartDate = promotionStartDate ? new Date(promotionStartDate) : null;
        }
        
        if (promotionEndDate !== undefined) {
            product.promotionEndDate = promotionEndDate ? new Date(promotionEndDate) : null;
        }
        
        // 清除已过期的促销
        const now = new Date();
        if (product.promotionEndDate && product.promotionEndDate < now) {
            product.isOnPromotion = false;
        }
        
        await product.save();
        
        return res.json({ 
            success: true, 
            message: product.isOnPromotion ? "Promotion is set" : "Promotion is cancelled",
            product
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 清理过期促销的函数
const clearExpiredPromotions = async (req, res) => {
    try {
        const now = new Date();
        
        // 找到所有过期的促销产品
        const expiredPromotions = await productModel.find({
            isOnPromotion: true,
            promotionEndDate: { $lt: now }
        });
        
        // 更新每个过期的促销产品
        for (const product of expiredPromotions) {
            product.isOnPromotion = false;
            await product.save();
        }
        
        return res.json({
            success: true, 
            message: `Cleaned ${expiredPromotions.length} expired promotions`,
            count: expiredPromotions.length
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    updateProductStock, 
    toggleProductStatus, 
    updateProduct, 
    updateProductImages,
    managePromotion,
    clearExpiredPromotions 
}