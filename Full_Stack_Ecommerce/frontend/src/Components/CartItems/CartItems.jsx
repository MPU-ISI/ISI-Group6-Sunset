import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { OrderContext } from "../../Context/OrderContext";
import { backend_url, currency } from "../../App";
import { Link, useNavigate } from 'react-router-dom';

const CartItems = () => {
  const { cartItems, removeFromCart, cartTotal, loading, updateCartItemQuantity, clearCart } = useContext(ShopContext);
  const { createOrder, setShowOrderModal, setSelectedOrder } = useContext(OrderContext);
  const navigate = useNavigate();
  
  // 结账状态
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState("");
  const [orderError, setOrderError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // 处理结账
  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    setIsCheckingOut(true);
  };
  
  // 处理订单提交
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setOrderError("Please enter a shipping address");
      return;
    }
    
    setProcessingOrder(true);
    setOrderError(null);
    
    try {
      // 创建订单的请求数据
      const orderData = {
        address: address.trim()
      };
      
      // 调用创建订单函数
      const success = await createOrder(orderData);
      
      if (success) {
        // 订单创建成功，清空购物车
        await clearCart();
        // 关闭结账表单
        setIsCheckingOut(false);
        // 显示成功消息
        alert("Order placed successfully!");
        // 跳转到订单详情或订单列表页面
        navigate("/orders");
      } else {
        setOrderError("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setOrderError("An error occurred while processing your order.");
    } finally {
      setProcessingOrder(false);
    }
  };
  
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

  // 取消结账
  const cancelCheckout = () => {
    setIsCheckingOut(false);
    setAddress("");
    setOrderError(null);
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
      
      {(!cartItems || cartItems.length === 0) ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      ) : (
        cartItems.map((item) => {
          // 从 cartItem 里获取产品详情信息
          const product = item.productDetails || {};
          const sku = item.skuDetails;
          const price = sku?.price || product.price || 0;
          // 尝试从多个源中获取产品ID，确保跳转链接的正确
          const prodId = product.productId || product.productID || item.productID;
          
          return (
            <div key={item.cartItemID}>
              <div className="cartitems-format-main cartitems-format">
                <img 
                  className="cartitems-product-icon" 
                  src={product.image ? backend_url + product.image : ""}
                  alt={product.name || "Product"}
                />
                <div className="cartitems-product-title">
                  <Link to={`/product/${prodId}`} className="cartitems-product-name">
                    {product.name || "Product name unavailable"}
                  </Link>
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
          <button 
            onClick={handleCheckout}
            disabled={!cartItems || cartItems.length === 0}
            className={!cartItems || cartItems.length === 0 ? "disabled-button" : ""}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
      
      {/* 结账表单 */}
      {isCheckingOut && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <div className="checkout-header">
              <h2>Complete Your Order</h2>
              <button className="close-checkout" onClick={cancelCheckout}>×</button>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="checkout-form">
              <div className="checkout-summary">
                <h3>Order Summary</h3>
                <div className="checkout-summary-items">
                  {cartItems.map((item, index) => {
                    const product = item.productDetails || {};
                    const sku = item.skuDetails;
                    const price = sku?.price || product.price || 0;
                    
                    return (
                      <div key={index} className="checkout-item">
                        <div className="checkout-item-name">
                          {product.name || "Product"} 
                          {sku && <span> ({formatOptions(sku.configurable_values)})</span>}
                        </div>
                        <div className="checkout-item-quantity">x{item.quantity}</div>
                        <div className="checkout-item-price">{currency}{(price * item.quantity).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="checkout-total">
                  <div className="checkout-total-row">
                    <span>Subtotal:</span>
                    <span>{currency}{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="checkout-total-row">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="checkout-total-row checkout-grand-total">
                    <span>Total:</span>
                    <span>{currency}{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="checkout-shipping">
                <h3>Shipping Information</h3>
                <div className="form-group">
                  <label htmlFor="shipping-address">Shipping Address *</label>
                  <textarea
                    id="shipping-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    required
                  ></textarea>
                </div>
              </div>
              
              {orderError && (
                <div className="checkout-error">
                  {orderError}
                </div>
              )}
              
              <div className="checkout-actions">
                <button 
                  type="button" 
                  className="cancel-checkout-btn"
                  onClick={cancelCheckout}
                  disabled={processingOrder}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="place-order-btn"
                  disabled={processingOrder}
                >
                  {processingOrder ? "Processing..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;