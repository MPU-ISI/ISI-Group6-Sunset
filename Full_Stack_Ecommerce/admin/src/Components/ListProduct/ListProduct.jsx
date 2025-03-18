import React, { useEffect, useState } from "react";
import { backend_url, currency } from "../../App";
import cross_icon from '../Assets/cross_icon.png';
import "./ListProduct.css";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterId, setFilterId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

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

  const handleEdit = async (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      old_price: product.old_price,
      new_price: product.new_price,
      category: product.category,
      available: product.available
    });
    setShowDetails(true);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const productId = selectedProduct.productID || selectedProduct.id;
      const url = `${backend_url}/api/products/${productId}`;

      console.log('Saving product edit - Request:', {
        productId,
        url,
        editForm,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(editForm),
      });

      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('Response data:', result);
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error('服务器返回了无效的响应格式');
      }

      if (!response.ok) {
        throw new Error(result.errors || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        await fetchInfo();
        setIsEditing(false);
        setEditForm(null);
        setShowDetails(false);
        alert("产品更新成功！");
      } else {
        throw new Error(result.errors || "更新产品失败");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.message || "更新产品失败");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    if (!window.confirm(`Are you sure you want to ${product.available ? 'disable' : 'enable'} this product?`)) {
      return;
    }

    setLoading(true);
    try {
      const productId = product.productID || product.id;
      const url = `${backend_url}/api/products/${productId}/status`;
      const newStatus = !product.available;

      console.log('Toggling product status - Request:', {
        productId,
        newStatus,
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ available: newStatus }),
      });

      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('Response data:', result);
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error('服务器返回了无效的响应格式');
      }

      if (!response.ok) {
        throw new Error(result.errors || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        await fetchInfo();
        alert(`产品已成功${newStatus ? '启用' : '禁用'}！`);
      } else {
        throw new Error(result.errors || "更新产品状态失败");
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      alert(error.message || "更新产品状态失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div>
        <input
          type="text"
          placeholder="Filter by Product ID"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
        />
      </div>
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
        <p>Status</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts
          .filter(product =>
            (product.productID && product.productID.toString().includes(filterId)) ||
            (product.id && product.id.toString().includes(filterId))
          )
          .map((product, index) => (
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
                <p>{product.available ? "Active" : "Disabled"}</p>
                <div className="listproduct-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => viewProductDetails(product)}
                  >
                    Details
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className={`status-btn ${product.available ? 'disable' : 'enable'}`}
                    onClick={() => handleToggleStatus(product)}
                  >
                    {product.available ? 'Disable' : 'Enable'}
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

      {/* 产品详情模态框 */}
      {showDetails && (
        <div className="product-details-modal">
          <div className="modal-content">
            <span className="close" onClick={() => {
              setShowDetails(false);
              setIsEditing(false);
              setEditForm(null);
            }}>&times;</span>
            <h2>{isEditing ? "Edit Product" : selectedProduct?.name + " Details"}</h2>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Old Price:</label>
                  <input
                    type="number"
                    value={editForm.old_price}
                    onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>New Price:</label>
                  <input
                    type="number"
                    value={editForm.new_price}
                    onChange={(e) => setEditForm({ ...editForm, new_price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={editForm.available ? "active" : "disabled"}
                    onChange={(e) => setEditForm({ ...editForm, available: e.target.value === "active" })}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button onClick={handleSaveEdit}>Save Changes</button>
                  <button onClick={() => {
                    setShowDetails(false);
                    setIsEditing(false);
                    setEditForm(null);
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              productDetails && (
                <>
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
                                alt={`${productDetails.name} ${idx + 1}`}
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
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;