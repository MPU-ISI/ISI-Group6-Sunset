import React, { useContext, useState, useEffect } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { WishlistContext } from '../../Context/WishlistContext';
import { backend_url, currency } from "../../App";

const ProductDisplay = ({ product }) => {
  const { addToCart, loading } = useContext(ShopContext);
  const { addToWishlist, wishlistLoading } = useContext(WishlistContext);
  
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedSku, setSelectedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [addStatus, setAddStatus] = useState({ message: "", type: "" });

  

  // 处理配置选项的变化

  useEffect(() => {
    if (product.isConfigurable) {
      console.group("Product Configuration Debug");
      console.log("Product:", product);
      console.log("Options:", product.options);
      console.log("SKUs:", product.skus);
      
      if (product.skus && product.skus.length > 0) {
        // 检查SKUs中的配置值是否完整
        const skuIssues = product.skus.filter(sku => 
          !sku.configurable_values || Object.keys(sku.configurable_values).length === 0
        );
        
        if (skuIssues.length > 0) {
          console.warn("Found SKUs with missing configurable_values:", skuIssues);
        }
      }
      
      console.groupEnd();
    }
  }, [product]);
  useEffect(() => {
    // 初始化主图片
    setMainImage(backend_url + product.image);
    
    // 如果产品是可配置的且有选项
    if (product.isConfigurable && product.options && product.options.length > 0) {
      // 初始化选择状态，为每个选项选择第一个值
      const initialOptions = {};
      product.options.forEach(option => {
        if (option.values && option.values.length > 0) {
          initialOptions[option.option_name] = option.values[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  // 当选项变化时，查找匹配的SKU
  useEffect(() => {
    if (product.isConfigurable && product.skus && product.skus.length > 0) {
      // 查找匹配所有选定选项的SKU
      const matchingSku = product.skus.find(sku => {
        // 检查sku的所有配置值是否与当前选择匹配
        if (!sku.configurable_values) return false;
        
        return Object.entries(selectedOptions).every(([optionName, optionValue]) => {
          return sku.configurable_values[optionName] === optionValue;
        });
      });
      
      setSelectedSku(matchingSku || null);
      
      // 如果找到匹配的SKU并且有图片，更新主图
      if (matchingSku && matchingSku.image_url) {
        setMainImage(backend_url + matchingSku.image_url);
      } else {
        setMainImage(backend_url + product.image);
      }
    }
  }, [selectedOptions, product]);

  // 处理选项变化
  const handleOptionChange = (optionName, optionValue) => {
    setSelectedOptions({
      ...selectedOptions,
      [optionName]: optionValue
    });
  };

  // 处理添加到购物车
  const handleAddToCart = async () => {
    // 重置状态消息
    setAddStatus({ message: "", type: "" });

      
    try {
      let result;
      
      if (product.isConfigurable) {
        if (selectedSku) {
          // 添加具有特定SKU的产品
          result = await addToCart(product.productID, quantity, selectedSku.sku_id);
        } else {
          setAddStatus({ 
            message: "Please select all options", 
            type: "error" 
          });
          return;
        }
      } else {
        // 添加简单产品
        console.log(product.id);
        console.log(product.productID);
        result = await addToCart(product.productID, quantity);
      }
      
      // 处理响应
      if (result.success) {
        setAddStatus({ 
          message: "Product added to cart successfully!", 
          type: "success" 
        });
        
        // 3秒后清除状态消息
        setTimeout(() => {
          setAddStatus({ message: "", type: "" });
        }, 3000);
      } else {
        setAddStatus({ 
          message: result.message || "Failed to add product to cart", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddStatus({ 
        message: "An error occurred. Please try again.", 
        type: "error" 
      });
    }
  };

  // 获取当前显示价格
  const getCurrentPrice = () => {
    if (product.isConfigurable && selectedSku && selectedSku.price) {
      return selectedSku.price;
    }
    return product.new_price;
  };

  // 获取库存状态
  const getInventoryStatus = () => {
    if (product.isConfigurable && selectedSku) {
      return selectedSku.inventory_status || "in_stock";
    }
    return "in_stock"; // 默认状态
  };

  // 添加到愿望单的处理函数
  const handleAddToWishlist = async () => {
    // 重置状态消息
    setAddStatus({ message: "", type: "" });
    
    try {
      const productID = product.id || product.productID;
      const skuId = selectedSku ? selectedSku.sku_id : null;
      
      // 添加愿望单的身份验证检查已经在WishlistContext中处理
      const success = await addToWishlist(productID, quantity, skuId);
      
      if (success) {
        setAddStatus({
          message: "Product added to wishlist successfully!",
          type: "success"
        });
        
        // 3秒后清除状态消息
        setTimeout(() => {
          setAddStatus({ message: "", type: "" });
        }, 3000);
      } else {
        setAddStatus({
          message: "Failed to add product to wishlist",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setAddStatus({
        message: "An error occurred. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img 
            src={backend_url + product.image} 
            alt="Main product" 
            onClick={() => setMainImage(backend_url + product.image)} 
          />
          {product.isConfigurable && product.skus && product.skus.map((sku, index) => 
            sku.image_url && sku.image_url !== product.image ? (
              <img 
                key={index} 
                src={backend_url + sku.image_url} 
                alt={`Variant ${index+1}`} 
                onClick={() => setMainImage(backend_url + sku.image_url)}
              />
            ) : null
          )}
          {product.additional_images && product.additional_images.map((img, index) => (
            <img 
              key={`add-img-${index}`} 
              src={backend_url + img} 
              alt={`Additional ${index+1}`} 
              onClick={() => setMainImage(backend_url + img)}
            />
          ))}
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={mainImage} alt="Selected product view" />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="dull star" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">{currency}{product.old_price}</div>
          <div className="productdisplay-right-price-new">{currency}{getCurrentPrice()}</div>
        </div>
        <div className="productdisplay-right-description">
          {product.description}
        </div>
        
        {/* 配置选项 */}
        {product.isConfigurable && product.options && product.options.map((option, optionIndex) => (
          <div className="productdisplay-right-options" key={optionIndex}>
            <h1>Select {option.option_name}</h1>
            <div className="productdisplay-right-option-values">
              {option.values && option.values.map((value, valueIndex) => (
                <div 
                  key={valueIndex}
                  className={`option-value ${selectedOptions[option.option_name] === value ? "selected" : ""}`}
                  onClick={() => handleOptionChange(option.option_name, value)}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* 库存状态 */}
        <div className="productdisplay-right-inventory">
          Status: <span className={getInventoryStatus() === "in_stock" ? "in-stock" : "out-of-stock"}>
            {getInventoryStatus() === "in_stock" ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        
        {/* 数量选择器 */}
        <div className="productdisplay-right-quantity">
          <h1>Quantity</h1>
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={loading || wishlistLoading}
            >-</button>
            <span>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              disabled={loading || wishlistLoading}
            >+</button>
          </div>
        </div>
        
        {/* 按钮组 */}
        <div className="productdisplay-right-buttons">
          {/* 添加到购物车按钮 */}
          <button 
            className={`add-to-cart-button ${loading ? "loading" : ""}`}
            onClick={handleAddToCart}
            disabled={
              loading || 
              wishlistLoading ||
              (product.isConfigurable && !selectedSku) || 
              getInventoryStatus() !== "in_stock"
            }
          >
            {loading ? "ADDING..." : "ADD TO CART"}
          </button>
          
          {/* 添加到愿望单按钮 */}
          <button 
            className={`add-to-wishlist-button ${wishlistLoading ? "loading" : ""}`}
            onClick={handleAddToWishlist}
            disabled={
              wishlistLoading || 
              loading ||
              (product.isConfigurable && !selectedSku)
              // 注意：不检查库存状态，允许添加缺货商品到愿望单
            }
          >
            {wishlistLoading ? "ADDING..." : "ADD TO WISHLIST"}
          </button>
        </div>
        
        {/* 状态消息 */}
        {addStatus.message && (
          <div className={`status-message ${addStatus.type}`}>
            {addStatus.message}
          </div>
        )}
        
        <p className="productdisplay-right-category">
          <span>Category :</span> {product.category}
        </p>
        
        {/* 属性信息 */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="productdisplay-right-attributes">
            <h1>Product Attributes</h1>
            {product.attributes.map((attr, index) => (
              <div key={index} className="attribute-item">
                <span className="attribute-name">{attr.attributeName || attr.name}: </span>
                <span className="attribute-value">{attr.details || attr.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;