import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png';
import edit_icon from '../Assets/edit_icon.jpg';
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchInfo = () => {
    fetch(`${backend_url}/allproducts`)
      .then((res) => res.json())
      .then((data) => setAllProducts(data));
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    await fetch(`${backend_url}/removeproduct`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    });

    fetchInfo();
  };

  const openEditPopup = (product) => {
    setSelectedProduct(product);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedProduct(null);
  };

  const handleEdit = async () => {
    await fetch(`${backend_url}/editproduct`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedProduct),
    });
    fetchInfo();
    closePopup();
  };

  const filteredProducts = allproducts.filter((product) =>
    product.id.toString().includes(searchId)
  );

  return (
    <div className="listproduct">
      {}
      <div className="listproduct-header">
        <h1>All Products List</h1>
        <div className="listproduct-filter">
          <label htmlFor="searchId">Filter by Product ID:</label>
          <input
            id="searchId"
            type="text"
            placeholder="Enter Product ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
      </div>

      <div className="listproduct-format-main">
        <p>ProductID</p> <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Edit</p> <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {filteredProducts.map((e, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <p>{e.id}</p>
              <a href={`http://localhost:3001/product/${e.id}`}>
                <img className="productIMG" src={`${backend_url}${e.image}`} alt={e.name} />
              </a>
              <p className="cartitems-product-title">{e.name}</p>
              <p>{currency}{e.old_price}</p>
              <p>{currency}{e.new_price}</p>
              <p>{e.category}</p>
              <img className="listproduct-edit-icon" onClick={() => { openEditPopup(e) }} src={edit_icon} alt="Edit" />
              <img className="listproduct-remove-icon" onClick={() => { removeProduct(e.id) }} src={cross_icon} alt="Remove" />
            </div>
            <hr />
          </div>
        ))}
      </div>
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Edit Product</h2>
            <label>Product Title:</label>
            <input
              type="text"
              value={selectedProduct.name}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
            />
            <label>Old Price:</label>
            <input
              type="number"
              value={selectedProduct.old_price}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, old_price: e.target.value })}
            />
            <label>New Price:</label>
            <input
              type="number"
              value={selectedProduct.new_price}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, new_price: e.target.value })}
            />
            <label>Category:</label>
            <select
              value={selectedProduct.category}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kid">Kid</option>
            </select>
            <button onClick={handleEdit}>Save Changes</button>
            <button onClick={closePopup}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;