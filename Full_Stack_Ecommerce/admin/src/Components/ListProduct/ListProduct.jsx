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
      // 使用admin专属路由获取所有产品
      const res = await fetch(`${backend_url}/api/products/adminAll`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products list");
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
      // 使用admin专属路由获取产品详情
      const response = await fetch(`${backend_url}/api/products/adminDetail/${id}`);
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
    // 使用productID或id
    await fetchProductDetails(product.productID || product.id);
  }

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedProduct(null);
    setProductDetails(null);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      {loading && <div className="loading-indicator">Loading...</div>}
      
      <div className="listproduct-format-main">
        <p>Product ID</p>
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Type</p>
        <p>Added Date</p>
        <p>Added</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <p className="product-id">{product.productID || product.id}</p>
              <a href={`http://localhost:3001/product/${product.id}`}>
                <img className="listproduct-product-icon" src={`${backend_url}${product.image}`} alt={product.name} />
              </a>
              <p className="cartitems-product-title">{product.name}</p>
              <p>{currency}{product.old_price}</p>
              <p>{currency}{product.new_price}</p>
              <p>{product.category}</p>
              <p className="hide-on-mobile">{product.isConfigurable ? "Configurable" : "Simple"}</p>
              <p className="hide-on-mobile">{formatDate(product.date)}</p>
              <div className="listproduct-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => viewProductDetails(product)}
                >
                  Details
                </button>
                <img 
                  className="listproduct-remove-icon" 
                  onClick={() => { removeProduct(product.productID || product.id) }} 
                  src={cross_icon} 
                  alt="Remove" 
                />
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>

      {/* 产品详情模态框 - 增强版 */}
      {showDetails && selectedProduct && productDetails && (
        <div className="product-details-modal">
          <div className="modal-content">
            <span className="close" onClick={closeDetails}>&times;</span>
            <h2>{selectedProduct.name} Details</h2>
            
            <div className="product-basic-info">
              <div className="product-images">
                <div className="main-image">
                  <h4>Main Image</h4>
                  <img 
                    src={productDetails.image.startsWith('http') ? 
                      productDetails.image : 
                      backend_url + productDetails.image} 
                    alt={productDetails.name} 
                  />
                </div>
                
                {productDetails.additional_images && productDetails.additional_images.length > 0 && (
                  <div className="additional-images">
                    <h4>Additional Images</h4>
                    <div className="image-grid">
                      {productDetails.additional_images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img.startsWith('http') ? img : backend_url + img} 
                          alt={`${productDetails.name} ${idx+1}`} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="product-info-details">
                <h3>Product Information</h3>
                <table>
                  <tbody>
                    <tr>
                      <td><strong>Product ID:</strong></td>
                      <td>{productDetails.productID || productDetails.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{productDetails.name}</td>
                    </tr>
                    <tr>
                      <td><strong>Description:</strong></td>
                      <td>{productDetails.description}</td>
                    </tr>
                    <tr>
                      <td><strong>Category:</strong></td>
                      <td>{productDetails.category}</td>
                    </tr>
                    <tr>
                      <td><strong>Category ID:</strong></td>
                      <td>{productDetails.categoryID}</td>
                    </tr>
                    <tr>
                      <td><strong>Regular Price:</strong></td>
                      <td>{currency}{productDetails.old_price}</td>
                    </tr>
                    <tr>
                      <td><strong>Sale Price:</strong></td>
                      <td>{currency}{productDetails.new_price}</td>
                    </tr>
                    <tr>
                      <td><strong>Type:</strong></td>
                      <td>{productDetails.isConfigurable ? "Configurable" : "Simple"}</td>
                    </tr>
                    <tr>
                      <td><strong>Available:</strong></td>
                      <td>{productDetails.available ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                      <td><strong>Added Date:</strong></td>
                      <td>{formatDate(productDetails.date)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 属性部分 */}
            {productDetails.attributes && productDetails.attributes.length > 0 && (
              <div className="product-attributes">
                <h3>Product Attributes</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Attribute Name</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetails.attributes.map((attr, index) => (
                      <tr key={index}>
                        <td><strong>{attr.attributeName}</strong></td>
                        <td>{attr.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* 选项部分 */}
            {productDetails.options && productDetails.options.length > 0 && (
              <div className="product-options">
                <h3>Product Options</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Option Name</th>
                      <th>Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetails.options.map((option, index) => (
                      <tr key={index}>
                        <td><strong>{option.option_name}</strong></td>
                        <td>
                        {option.values && Array.isArray(option.values) 
                          ? option.values.join(', ') 
                          : (typeof option.values === 'string' 
                            ? option.values 
                            : 'No values available')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* SKU部分 */}
            {productDetails.skus && productDetails.skus.length > 0 && (
              <div className="product-skus">
                <h3>Product SKUs ({productDetails.skus.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th>SKU Code</th>
                      <th>Configuration</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetails.skus.map((sku, index) => (
                      <tr key={index}>
                        <td>{sku.sku_code}</td>
                        <td>
                          {sku.configurable_values && typeof sku.configurable_values === 'object' ? 
                            Object.entries(sku.configurable_values).map(([key, value]) => (
                              <div key={key}><strong>{key}:</strong> {value}</div>
                            )) : 'N/A'}
                        </td>
                        <td>{currency}{sku.price}</td>
                        <td>{sku.quantity}</td>
                        <td>{sku.inventory_status}</td>
                        <td>
                          {sku.image_url && (
                            <img 
                              src={sku.image_url.startsWith('http') ? 
                                sku.image_url : 
                                backend_url + sku.image_url} 
                              alt={sku.sku_code}
                              className="sku-thumbnail" 
                            />
                          )}
                        </td>
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