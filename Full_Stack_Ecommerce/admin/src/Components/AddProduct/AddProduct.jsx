import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [isConfigurable, setIsConfigurable] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [options, setOptions] = useState([]);
  const [skus, setSkus] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ attributeName: "", details: "" });
  const [newOption, setNewOption] = useState({ option_name: "", values: "" });
  
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
    isConfigurable: false,
    categoryID: 1,
  });

  const addAttribute = () => {
    if (newAttribute.attributeName.trim() === "") return;
    setAttributes([...attributes, {
      attributeName: newAttribute.attributeName,
      details: newAttribute.details
    }]);
    setNewAttribute({ attributeName: "", details: "" });
  };

  const addOption = () => {
    if (newOption.option_name.trim() === "") return;
    // 将逗号分隔的值转换为数组
    const valuesArray = newOption.values.split(',').map(val => val.trim());
    setOptions([...options, {
      option_name: newOption.option_name,
      values: valuesArray
    }]);
    setNewOption({ option_name: "", values: "" });
  };

  const generateSkus = () => {
    // 只处理有值的选项
    const validOptions = options.filter(option => option.values.length > 0);
    
    if (validOptions.length === 0) {
      alert("请先添加选项和值");
      return;
    }
    
    // 递归生成所有可能的组合
    const generateCombinations = (optionIndex = 0, currentCombination = {}) => {
      if (optionIndex >= validOptions.length) {
        // 基本价格使用主产品价格
        const basePrice = parseFloat(productDetails.new_price) || 0;
        
        setSkus(prev => [...prev, {
          configurable_values: { ...currentCombination },
          sku_code: `SKU-${skus.length + 1}`,
          inventory_status: "in_stock",
          quantity: 0,
          price: basePrice,
          image_url: ""
        }]);
        return;
      }
      
      const currentOption = validOptions[optionIndex];
      for (const value of currentOption.values) {
        const newCombination = { ...currentCombination };
        newCombination[currentOption.option_name] = value;
        generateCombinations(optionIndex + 1, newCombination);
      }
    };
    
    // 清空当前SKUs并生成新的
    setSkus([]);
    generateCombinations();
  };

  const updateSkuField = (index, field, value) => {
    const updatedSkus = [...skus];
    updatedSkus[index][field] = value;
    setSkus(updatedSkus);
  };

  const removeAttribute = (index) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  const removeOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const removeSku = (index) => {
    const newSkus = [...skus];
    newSkus.splice(index, 1);
    setSkus(newSkus);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const toggleConfigurable = () => {
    setIsConfigurable(!isConfigurable);
    setProductDetails({ ...productDetails, isConfigurable: !isConfigurable });
  };

  const AddProduct = async () => {
    let dataObj;
    let product = { ...productDetails };

    // 处理图片上传
    if (image) {
      let formData = new FormData();
      formData.append('product', image);

      await fetch(`${backend_url}/api/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      }).then((resp) => resp.json())
        .then((data) => { dataObj = data });

      if (dataObj.success) {
        product.image = dataObj.image_url;
      } else {
        alert("Image upload failed");
        return;
      }
    } else {
      alert("Please select an image");
      return;
    }

    // 如果是可配置产品，添加属性、选项和SKU
    if (isConfigurable) {
      product.attributes = attributes;
      product.options = options;
      product.skus = skus;
    }

    // 发送产品数据到后端
    try {
      const response = await fetch(`${backend_url}/api/products/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Product Added Successfully");
        
        // 重置表单
        setProductDetails({
          name: "",
          description: "",
          image: "",
          category: "women",
          new_price: "",
          old_price: "",
          isConfigurable: false,
          categoryID: 1,
        });
        setImage(false);
        setIsConfigurable(false);
        setAttributes([]);
        setOptions([]);
        setSkus([]);
      } else {
        alert("Failed to add product: " + (data.errors || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="addproduct">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input type="text" name="name" value={productDetails.name} onChange={changeHandler} placeholder="Type here" />
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <input type="text" name="description" value={productDetails.description} onChange={changeHandler} placeholder="Type here" />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input type="number" name="old_price" value={productDetails.old_price} onChange={changeHandler} placeholder="Type here" />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input type="number" name="new_price" value={productDetails.new_price} onChange={changeHandler} placeholder="Type here" />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select value={productDetails.category} name="category" className="add-product-selector" onChange={changeHandler}>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Category ID</p>
        <input type="number" name="categoryID" value={productDetails.categoryID} onChange={changeHandler} placeholder="Category ID" />
      </div>
      <div className="addproduct-itemfield">
        <p>Product image</p>
        <label htmlFor="file-input">
          <img className="addproduct-thumbnail-img" src={!image ? upload_area : URL.createObjectURL(image)} alt="" />
        </label>
        <input onChange={(e) => setImage(e.target.files[0])} type="file" name="image" id="file-input" accept="image/*" hidden />
      </div>
      
      {/* 可配置产品开关 */}
      <div className="addproduct-configurable">
        <label>
          <input 
            type="checkbox"
            checked={isConfigurable}
            onChange={toggleConfigurable}
          />
          Is Configurable Product
        </label>
      </div>
      
      {/* 可配置产品特有部分 */}
      {isConfigurable && (
        <div className="configurable-product-section">
          <h3>Product Attributes</h3>
          <div className="attribute-input">
            <input
              type="text"
              placeholder="Attribute Name"
              value={newAttribute.attributeName}
              onChange={(e) => setNewAttribute({...newAttribute, attributeName: e.target.value})}
            />
            <input
              type="text"
              placeholder="Details"
              value={newAttribute.details}
              onChange={(e) => setNewAttribute({...newAttribute, details: e.target.value})}
            />
            <button onClick={addAttribute}>Add Attribute</button>
          </div>
          
          {attributes.length > 0 && (
            <div className="attributes-list">
              <h4>Added Attributes</h4>
              {attributes.map((attr, index) => (
                <div key={index} className="attribute-item">
                  <p><strong>{attr.attributeName}</strong>: {attr.details}</p>
                  <button onClick={() => removeAttribute(index)}>Remove</button>
                </div>
              ))}
            </div>
          )}
          
          <h3>Product Options</h3>
          <div className="option-input">
            <input
              type="text"
              placeholder="Option Name (e.g. Color)"
              value={newOption.option_name}
              onChange={(e) => setNewOption({...newOption, option_name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Values (comma separated, e.g. Red,Blue,Green)"
              value={newOption.values}
              onChange={(e) => setNewOption({...newOption, values: e.target.value})}
            />
            <button onClick={addOption}>Add Option</button>
          </div>
          
          {options.length > 0 && (
            <div className="options-list">
              <h4>Added Options</h4>
              {options.map((opt, index) => (
                <div key={index} className="option-item">
                  <p>
                    <strong>{opt.option_name}</strong>: {Array.isArray(opt.values) ? opt.values.join(', ') : opt.values}
                  </p>
                  <button onClick={() => removeOption(index)}>Remove</button>
                </div>
              ))}
            </div>
          )}
          
          <h3>Manage SKUs</h3>
          <button onClick={generateSkus}>Generate SKUs from Options</button>
          
          {skus.length > 0 && (
            <div className="skus-list">
              <h4>Product SKUs</h4>
              <table className="skus-table">
                <thead>
                  <tr>
                    <th>Configuration</th>
                    <th>SKU Code</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map((sku, index) => (
                    <tr key={index}>
                      <td>
                        {Object.entries(sku.configurable_values).map(([key, value]) => (
                          <span key={key}>{key}: {value}, </span>
                        ))}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={sku.sku_code}
                          onChange={(e) => updateSkuField(index, 'sku_code', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={sku.quantity}
                          onChange={(e) => updateSkuField(index, 'quantity', parseInt(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={sku.price}
                          onChange={(e) => updateSkuField(index, 'price', parseFloat(e.target.value))}
                        />
                      </td>
                      <td>
                        <button onClick={() => removeSku(index)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      <button className="addproduct-btn" onClick={AddProduct}>ADD</button>
    </div>
  );
};

export default AddProduct;