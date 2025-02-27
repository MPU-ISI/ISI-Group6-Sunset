import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const CartItems = () => {
  const { products, loading } = useContext(ShopContext);
  const { cartItems, removeFromCart, getTotalCartAmount, getProductDetails } = useContext(ShopContext);
  const [cartProducts, setCartProducts] = useState([]);

  // 处理购物车项目数据，转换为易于渲染的格式
  useEffect(() => {
    if (loading) return;

    const items = [];
    
    for (const itemKey in cartItems) {
      if (cartItems[itemKey] <= 0) continue;
      
      // 检查是否是包含SKU的产品
      if (itemKey.includes('-')) {
        const [productId, skuId] = itemKey.split('-');
        const productDetails = getProductDetails(Number(productId), Number(skuId));
        
        if (productDetails) {
          items.push({
            key: itemKey,
            id: Number(productId),
            skuId: Number(skuId),
            name: productDetails.name,
            image: productDetails.currentImage,
            price: productDetails.currentPrice,
            quantity: cartItems[itemKey],
            isConfigurable: true,
            options: productDetails.skus?.find(s => s.sku_id === Number(skuId))?.configurable_values || {}
          });
        }
      } else {
        // 普通产品
        const product = products.find(p => p.id === Number(itemKey));
        
        if (product) {
          items.push({
            key: itemKey,
            id: product.id,
            skuId: null,
            name: product.name,
            image: product.image,
            price: product.new_price,
            quantity: cartItems[itemKey],
            isConfigurable: false
          });
        }
      }
    }
    
    setCartProducts(items);
  }, [cartItems, products, loading, getProductDetails]);

  // 格式化选项显示
  const formatOptions = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    
    return Object.entries(options)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');
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
      
      {cartProducts.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      ) : (
        cartProducts.map((item) => (
          <div key={item.key}>
            <div className="cartitems-format-main cartitems-format">
              <img 
                className="cartitems-product-icon" 
                src={backend_url + item.image} 
                alt={item.name}
              />
              <div className="cartitems-product-title">
                <p>{item.name}</p>
                {item.isConfigurable && (
                  <span className="cartitems-product-options">
                    {formatOptions(item.options)}
                  </span>
                )}
              </div>
              <p>{currency}{item.price}</p>
              <button className="cartitems-quantity">{item.quantity}</button>
              <p>{currency}{(item.price * item.quantity).toFixed(2)}</p>
              <img 
                onClick={() => removeFromCart(item.id, item.skuId)} 
                className="cartitems-remove-icon" 
                src={cross_icon} 
                alt="Remove" 
              />
            </div>
            <hr />
          </div>
        ))
      )}
      
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount().toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{getTotalCartAmount().toFixed(2)}</h3>
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