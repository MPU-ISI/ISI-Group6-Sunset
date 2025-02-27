import React, { useContext, useState, useEffect } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedSku, setSelectedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  // 处理配置选项的变化
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
  const handleAddToCart = () => {
    if (product.isConfigurable) {
      if (selectedSku) {
        // 添加具有特定SKU的产品
        addToCart(product.id, quantity, selectedSku.sku_id);
      } else {
        alert("Please select all options");
      }
    } else {
      // 添加简单产品
      addToCart(product.id, quantity);
    }
  };

  // 获取当前显示价格
  const getCurrentPrice = () => {
    if (product.isConfigurable && selectedSku) {
      return selectedSku.price;
    }
    return product.new_price;
  };

  // 获取库存状态
  const getInventoryStatus = () => {
    if (product.isConfigurable && selectedSku) {
      return selectedSku.inventory_status;
    }
    return "in_stock"; // 默认状态
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={backend_url + product.image} alt="img" onClick={() => setMainImage(backend_url + product.image)} />
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
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={mainImage} alt="img" />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
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
                  className={selectedOptions[option.option_name] === value ? "selected" : ""}
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
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={product.isConfigurable && !selectedSku || getInventoryStatus() !== "in_stock"}
        >
          ADD TO CART
        </button>
        
        <p className="productdisplay-right-category">
          <span>Category :</span> {product.category}
        </p>
        
        {/* 属性信息 */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="productdisplay-right-attributes">
            <h1>Product Attributes</h1>
            {product.attributes.map((attr, index) => (
              <div key={index} className="attribute-item">
                <span className="attribute-name">{attr.attributeName}: </span>
                <span className="attribute-value">{attr.details}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;