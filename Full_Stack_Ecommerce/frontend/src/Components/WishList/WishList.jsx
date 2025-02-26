import React, { useState } from 'react';
import "./WishList.css";

const Wishlist = () => {
  // Create some fake data for demonstration
  const initialWishlist = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      img: "https://via.placeholder.com/55",
      onSale: true
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      img: "https://via.placeholder.com/55",
      onSale: false
    },
    {
      id: 3,
      name: "Gaming Mouse",
      price: 49.99,
      img: "https://via.placeholder.com/55",
      onSale: true
    }
  ];

  const [wishlist, setWishlist] = useState(initialWishlist);

  // Remove an item from the wishlist
  const removeItem = (id) => {
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(updatedWishlist);
  };

  // Simulate adding an item to the shopping cart
  const addToCart = (item) => {
    // In a real application, you might call a service or update a global state
    alert(`Added ${item.name} to cart!`);
  };

  return (
    <div className="wishlist">
      <h2>My Wishlist</h2>
      <hr />
      <div className="wishlist-format-main">
        <span>Product</span>
        <span>Price</span>
        <span>Sale</span>
        <span>Actions</span>
      </div>
      {wishlist.length > 0 ? (
        wishlist.map(item => (
          <div className="wishlist-format" key={item.id}>
            <div className="wishlist-product">
              <img
                className="wishlist-product-icon"
                src={item.img}
                alt={item.name}
              />
              <span>{item.name}</span>
            </div>
            <div className="wishlist-price">
              ${item.price.toFixed(2)}
            </div>
            <div className="wishlist-sale">
              {item.onSale ? (
                <span className="sale-label">On Sale!</span>
              ) : (
                <span>-</span>
              )}
            </div>
            <div className="wishlist-actions">
              <button onClick={() => addToCart(item)}>Add to Cart</button>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))
      ) : (
        <p>Your wishlist is empty.</p>
      )}
    </div>
  );
};

export default Wishlist;