import React, { createContext, useEffect, useState } from 'react';
import { backend_url } from '../App';

export const ShopContext = createContext({
  products: [],
  cartItems: [],
  cartTotal: 0,
  loading: false,
  addToCart: () => Promise.resolve(false),
  removeFromCart: () => Promise.resolve(false),
  updateCartItemQuantity: () => Promise.resolve(false),
  clearCart: () => Promise.resolve(false),
  fetchCart: () => Promise.resolve(false)
});

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取所有产品
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${backend_url}/api/products/all`);
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 获取购物车内容
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // 获取认证令牌
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't fetch cart");
        setCartItems([]);
        setCartTotal(0);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${backend_url}/api/cart`, {
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        console.error("Error fetching cart, status:", response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items || []);
        setCartTotal(data.cart.total || 0);
      } else {
        console.error("API returned success: false", data);
        throw new Error(data.message || "Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 在页面加载时获取购物车
  useEffect(() => {
    fetchCart();
  }, []);

  // 添加商品到购物车
  const addToCart = async (productID, quantity = 1, sku_id = null) => {
    try {
      const token = localStorage.getItem('auth-token');
      console.log(1);
      
      if (!token) {
        console.log("No auth token found, can't add to cart");
        return;
      }
      
      const response = await fetch(`${backend_url}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ productID, quantity, sku_id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items || []);
        setCartTotal(data.cart.total || 0);
        return true;
      } else {
        console.error("Failed to add to cart:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  // 从购物车中移除商品
  const removeFromCart = async (cartItemID) => {
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't remove from cart");
        return;
      }
      
      const response = await fetch(`${backend_url}/api/cart/remove/${cartItemID}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items || []);
        setCartTotal(data.cart.total || 0);
        return true;
      } else {
        console.error("Failed to remove from cart:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  };

  // 更新购物车中商品数量
  const updateCartItemQuantity = async (cartItemID, quantity) => {
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't update cart");
        return;
      }
      
      const response = await fetch(`${backend_url}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ cartItemID, quantity })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items || []);
        setCartTotal(data.cart.total || 0);
        return true;
      } else {
        console.error("Failed to update cart:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      return false;
    }
  };

  // 清空购物车
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't clear cart");
        return;
      }
      
      const response = await fetch(`${backend_url}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems([]);
        setCartTotal(0);
        return true;
      } else {
        console.error("Failed to clear cart:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  };

  const contextValue = {
    products,
    cartItems,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    fetchCart
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;