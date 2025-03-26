import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

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
            date: Date.now()
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
        const { search, showDisabled, category, subCategory } = req.query;
        let products = [];
        let query = {};
        
        // 处理搜索条件
        if (search) {
            // 按名称搜索
            const nameRegex = new RegExp(search, 'i');
            query.name = nameRegex;
        }
        
        // 处理类别搜索
        if (category) {
            query.category = category;
        }
        
        // 处理子类别搜索
        if (subCategory) {
            query.subCategory = subCategory;
        }
        
        // 默认只显示启用的产品，除非明确要求显示所有产品
        if (showDisabled !== 'true') {
            query.enabled = { $ne: false };
        }
        
        // 获取产品列表
        products = await productModel.find(query);
        
        // 如果是搜索ID，需要额外处理
        if (search) {
            // 获取所有产品进行ID搜索
            const allProducts = await productModel.find({ _id: { $exists: true } });
            const productsByIdSubstring = allProducts.filter(product => 
                product._id.toString().includes(search)
            );
            
            // 如果不显示禁用产品，过滤掉禁用的产品
            const filteredByIdProducts = showDisabled === 'true' 
                ? productsByIdSubstring 
                : productsByIdSubstring.filter(p => p.enabled !== false);
            
            // 合并结果并去重
            const mergedProducts = [...products];
            
            // 添加ID匹配的产品（如果不重复）
            filteredByIdProducts.forEach(product => {
                if (!mergedProducts.some(p => p._id.toString() === product._id.toString())) {
                    mergedProducts.push(product);
                }
            });
            
            products = mergedProducts;
        }
        
        res.json({success: true, products});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
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
            return res.json({ success: false, message: "缺少必要参数" });
        }

        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "产品不存在" });
        }

        // 获取当前尺码的库存
        const currentStock = product.sizes.get(size) || 0;
        
        // 计算新库存
        const newStock = currentStock + Number(quantity);
        
        // 确保库存不小于0
        if (newStock < 0) {
            return res.json({ success: false, message: "库存不足" });
        }

        // 更新库存
        product.sizes.set(size, newStock);
        await product.save();

        res.json({ success: true, message: "库存已更新", newStock });

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
            return res.json({ success: false, message: "产品ID不能为空" });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "产品不存在" });
        }
        
        // 切换状态
        product.enabled = !product.enabled;
        await product.save();
        
        return res.json({ 
            success: true, 
            message: product.enabled ? "产品已启用" : "产品已禁用",
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
        const { productId, name, description, price, category, subCategory, bestseller } = req.body;
        
        if (!productId) {
            return res.json({ success: false, message: "产品ID不能为空" });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({ success: false, message: "产品不存在" });
        }
        
        // 更新信息
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = Number(price);
        if (category) product.category = category;
        if (subCategory) product.subCategory = subCategory;
        if (bestseller !== undefined) product.bestseller = bestseller === "true" || bestseller === true;
        
        await product.save();
        
        return res.json({ 
            success: true, 
            message: "产品信息已更新",
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

export { listProducts, addProduct, removeProduct, singleProduct, updateProductStock, toggleProductStatus, updateProduct, updateProductImages }