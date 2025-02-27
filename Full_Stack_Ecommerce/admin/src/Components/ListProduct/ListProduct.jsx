import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backend_url}/api/products/all`);
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${backend_url}/api/products/remove`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchInfo();
      } else {
        alert("Failed to remove product: " + (result.errors || "Unknown error"));
      }
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Failed to remove product");
    } finally {
      setLoading(false);
    }
  }

  const fetchProductDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${backend_url}/products/detail/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProductDetails(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      alert("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }

  const viewProductDetails = async (product) => {
    setSelectedProduct(product);
    await fetchProductDetails(product.id);
  }

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedProduct(null);
    setProductDetails(null);
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      {loading && <div className="loading-indicator">Loading...</div>}
      
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Type</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <img className="listproduct-product-icon" src={backend_url + product.image} alt="" />
              <p className="cartitems-product-title">{product.name}</p>
              <p>{currency}{product.old_price}</p>
              <p>{currency}{product.new_price}</p>
              <p>{product.category}</p>
              <p>{product.isConfigurable ? "Configurable" : "Simple"}</p>
              <div className="listproduct-actions">
                {product.isConfigurable && (
                  <button 
                    className="view-details-btn"
                    onClick={() => viewProductDetails(product)}
                  >
                    Details
                  </button>
                )}
                <img 
                  className="listproduct-remove-icon" 
                  onClick={() => { removeProduct(product.id) }} 
                  src={cross_icon} 
                  alt="Remove" 
                />
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>

      {/* 产品详情模态框 */}
      {showDetails && selectedProduct && productDetails && (
        <div className="product-details-modal">
          <div className="modal-content">
            <span className="close" onClick={closeDetails}>&times;</span>
            <h2>{selectedProduct.name} Details</h2>
            
            {/* 属性部分 */}
            {productDetails.attributes && productDetails.attributes.length > 0 && (
              <div className="product-attributes">
                <h3>Product Attributes</h3>
                <ul>
                  {productDetails.attributes.map((attr, index) => (
                    <li key={index}>
                      <strong>{attr.attributeName}</strong>: {attr.details}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 选项部分 */}
            {productDetails.options && productDetails.options.length > 0 && (
              <div className="product-options">
                <h3>Product Options</h3>
                <ul>
                  {productDetails.options.map((option, index) => (
                    <li key={index}>
                      <strong>{option.option_name}</strong>: {Array.isArray(option.values) ? option.values.join(', ') : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* SKU部分 */}
            {productDetails.skus && productDetails.skus.length > 0 && (
              <div className="product-skus">
                <h3>Product SKUs</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Configuration</th>
                      <th>SKU Code</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetails.skus.map((sku, index) => (
                      <tr key={index}>
                        <td>
                          {sku.configurable_values ? 
                            Object.entries(sku.configurable_values).map(([key, value]) => (
                              <span key={key}>{key}: {value}, </span>
                            )) : 'N/A'}
                        </td>
                        <td>{sku.sku_code}</td>
                        <td>{sku.quantity}</td>
                        <td>{currency}{sku.price}</td>
                        <td>{sku.inventory_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;