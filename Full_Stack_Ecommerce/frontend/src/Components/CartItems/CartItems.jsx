import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const CartItems = () => {
  const { cartItems, removeFromCart, cartTotal, loading, updateCartItemQuantity } = useContext(ShopContext);

  // 格式化选项显示
  const formatOptions = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    
    return Object.entries(options)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');
  };

  // 增加/减少购物车中商品数量
  const handleQuantityChange = (cartItemID, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateCartItemQuantity(cartItemID, newQuantity);
    } else if (newQuantity === 0) {
      removeFromCart(cartItemID);
    }
  };

  if (loading) {
    return <div className="loading">Loading cart items...</div>;
  }

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      
      {!cartItems || cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      ) : (
        cartItems.map((item) => {
          // 获取产品和SKU信息
          const product = item.productDetails || {};
          const sku = item.skuDetails;
          const price = sku?.price || product.price || 0;
          
          return (
            <div key={item.cartItemID}>
              <div className="cartitems-format-main cartitems-format">
                <img 
                  className="cartitems-product-icon" 
                  src={product.image ? backend_url + product.image : ""}
                  alt={product.name || "Product"}
                />
                <div className="cartitems-product-title">
                  <p>{product.name || "Product name unavailable"}</p>
                  {sku && (
                    <span className="cartitems-product-options">
                      {formatOptions(sku.configurable_values)}
                    </span>
                  )}
                </div>
                <p>{currency}{price}</p>
                <div className="cartitems-quantity-controls">
                  <button onClick={() => handleQuantityChange(item.cartItemID, item.quantity, -1)}>-</button>
                  <span className="cartitems-quantity">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.cartItemID, item.quantity, 1)}>+</button>
                </div>
                <p>{currency}{(price * item.quantity).toFixed(2)}</p>
                <img 
                  onClick={() => removeFromCart(item.cartItemID)} 
                  className="cartitems-remove-icon" 
                  src={cross_icon} 
                  alt="Remove" 
                />
              </div>
              <hr />
            </div>
          );
        })
      )}
      
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{cartTotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{cartTotal.toFixed(2)}</h3>
            </div>
          </div>
          <button>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;