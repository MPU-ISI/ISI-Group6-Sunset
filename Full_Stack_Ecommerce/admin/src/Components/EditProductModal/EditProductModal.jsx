import React, { useState, useEffect } from 'react';
import './EditProductModal.css';
import { backend_url } from '../../App';

const EditProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    old_price: '',
    new_price: '',
    category: '',
    categoryID: '',
    isConfigurable: false
  });

  useEffect(() => {
    if (product) {
      // 使用产品详情中对应的字段填充表单
      setFormData({
        name: product.name || '',
        description: product.description || '',
        old_price: product.old_price || '',
        new_price: product.new_price || '',
        category: product.category || '',
        categoryID: product.categoryID || '',
        isConfigurable: product.isConfigurable || false
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 优先用 product.productID，再用 product.id
      const prodId = product.productID || product.id;
      const response = await fetch(`${backend_url}/api/products/update/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert("Product updated successfully!");
        onSave(data.product); // 通知父组件，可刷新列表
        onClose();
      } else {
        alert("Update failed: " + (data.errors || "Unknown error"));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed. Please try again.");
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <span className="edit-modal-close" onClick={onClose}>&times;</span>
        <h2>Edit Product Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Regular Price</label>
            <input 
              type="number"
              name="old_price"
              value={formData.old_price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Sale Price</label>
            <input 
              type="number"
              name="new_price"
              value={formData.new_price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input 
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category ID</label>
            <input 
              type="number"
              name="categoryID"
              value={formData.categoryID}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input 
                type="checkbox"
                name="isConfigurable"
                checked={formData.isConfigurable}
                onChange={handleChange}
              />
              Configurable Product
            </label>
          </div>
          <button type="submit" className="submit-btn">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;