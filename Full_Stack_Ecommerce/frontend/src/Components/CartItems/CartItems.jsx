import React, { useContext, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const CartItems = () => {
  const { cartItems, removeFromCart, cartTotal, updateCartItemQuantity, getTotalCartAmount } = useContext(ShopContext);
  const [address, setAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
  const handleQuantityChange = async (cartItemID, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      await updateCartItemQuantity(cartItemID, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('购物车是空的');
      return;
    }

    setShowAddressModal(true);
  };

  const processOrder = async () => {
    if (!address.trim()) {
      alert('请输入收货地址');
      return;
    }

    try {
      console.log('原始购物车数据:', cartItems); // 调试用

      // 简化订单项数据
      const items = cartItems.map(item => ({
        product: item.productDetails._id,
        quantity: item.quantity,
        price: item.skuDetails?.price || item.productDetails.price
      }));

      const orderData = {
        items,
        address,
        total: cartTotal
      };

      console.log('发送的订单数据:', orderData); // 调试用
      console.log('认证token:', localStorage.getItem('auth-token')); // 调试用

      const response = await fetch('http://localhost:3000/api/user/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('响应状态:', response.status); // 调试用
      const text = await response.text();
      console.log('服务器原始响应:', text); // 调试用

      if (text) {
        try {
          const data = JSON.parse(text);
          if (response.ok) {
            alert('订单创建成功！');
            navigate('/orders');
            return;
          } else {
            throw new Error(data.message || '订单创建失败');
          }
        } catch (e) {
          console.error('JSON解析错误:', e);
          throw new Error('服务器响应格式错误');
        }
      } else {
        throw new Error('服务器没有返回数据');
      }
    } catch (error) {
      console.error('结算失败:', error);
      alert(`结算失败: ${error.message}`);
    } finally {
      setShowAddressModal(false);
    }
  };

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
          <button onClick={() => navigate('/')}>继续购物</button>
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
          <button onClick={handleCheckout}>结算</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="address-modal">
          <div className="modal-content">
            <h3>请输入收货地址</h3>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="请输入详细收货地址"
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={() => setShowAddressModal(false)}>取消</button>
              <button onClick={processOrder}>确认下单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;