import React, { createContext, useState, useEffect } from 'react';
import { backend_url } from '../App';

// 创建上下文并提供默认值
export const WishlistContext = createContext({
  wishlistItems: [],
  loading: false,
  error: null,
  wishlistLoading: false,
  fetchWishlist: () => {},
  addToWishlist: () => Promise.resolve(false),
  removeFromWishlist: () => Promise.resolve(false),
  clearWishlist: () => Promise.resolve(false),
  addToCartFromWishlist: () => Promise.resolve(false),
  isAuthenticated: false
});

const WishlistContextProvider = (props) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState(null);

  // 添加弹窗状态
    const [notification, setNotification] = useState({
      show: false,
      message: '',
      type: 'success' // 可以是 'success', 'error', 'info' 等
    });
  
    // 显示通知弹窗
    const showNotification = (message, type = 'success') => {
      setNotification({
        show: true,
        message,
        type
      });
      // 2秒后自动关闭通知
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 2000);
    };

  // 检查是否已认证
  const isAuthenticated = () => {
    return localStorage.getItem('auth-token') ? true : false;
  };

  // 获取愿望单
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 检查是否已认证
      if (!isAuthenticated()) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${backend_url}/api/wishlist`, {
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setWishlistItems(data.items || []);
      } else {
        throw new Error(data.errors || 'Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError(error.message);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 在组件挂载时获取愿望单
  useEffect(() => {
    fetchWishlist();
  }, []);

  // 添加商品到愿望单
  const addToWishlist = async (productId, quantity = 1, sku_id = null) => {
    try {
      setWishlistLoading(true);
      setError(null);
      
      // 检查是否已认证
      if (!isAuthenticated()) {
        alert('请先登录');
        return false;
      }
      
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${backend_url}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ 
          productId: Number(productId),
          quantity: Number(quantity),
          sku_id: sku_id ? Number(sku_id) : null
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 重新获取愿望单以获取最新数据
        await fetchWishlist();
        return true;
      } else {
        throw new Error(data.errors || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setError(error.message);
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  // 从愿望单中移除商品
  const removeFromWishlist = async (itemId) => {
    try {
      setError(null);
      
      if (!isAuthenticated()) {
        alert('请先登录');
        return false;
      }
      
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${backend_url}/api/wishlist/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 更新本地状态以移除项目
        setWishlistItems(wishlistItems.filter(item => item.id !== Number(itemId)));
        showNotification(`Remove successfully`);
        return true;
      } else {
        throw new Error(data.errors || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError(error.message);
      alert('从愿望单移除失败: ' + error.message);
      return false;
    }
  };

  // 清空愿望单
  const clearWishlist = async () => {
    try {
      setError(null);
      
      // 检查是否已认证
      if (!isAuthenticated()) {
        alert('请先登录');
        return false;
      }
      
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${backend_url}/api/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setWishlistItems([]);
        showNotification(`Clear successfully!`);
        return true;
      } else {
        throw new Error(data.errors || 'Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setError(error.message);
      alert('清空愿望单失败: ' + error.message);
      return false;
    }
  };

  // 添加到购物车并从愿望单移除
  const addToCartFromWishlist = async (item, shopContext) => {
    try {
      // 检查是否已认证
      if (!isAuthenticated()) {
        alert('请先登录');
        return false;
      }
      
      if (!shopContext || !shopContext.addToCart) {
        throw new Error('购物车上下文不可用');
      }
      
      // 首先添加到购物车
      const addedToCart = await shopContext.addToCart(
        item.productId, 
        item.quantity, 
        item.sku_id
      );
      
      if (addedToCart) {
        // 然后从愿望单移除
        await removeFromWishlist(item.id);

        return true;
      } else {
        throw new Error('添加到购物车失败');
      }
    } catch (error) {
      console.error('Error moving item from wishlist to cart:', error);
      setError(error.message);
      alert('移动到购物车失败: ' + error.message);
      return false;
    }
  };

  const contextValue = {
    wishlistItems,
    loading,
    error,
    wishlistLoading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    addToCartFromWishlist,
    isAuthenticated: isAuthenticated()
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;