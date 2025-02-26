import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png';
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [searchId, setSearchId] = useState('');

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
        <p>ProductID</p> <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Remove</p>
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
              <img className="listproduct-remove-icon" onClick={() => { removeProduct(e.id) }} src={cross_icon} alt="" />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;