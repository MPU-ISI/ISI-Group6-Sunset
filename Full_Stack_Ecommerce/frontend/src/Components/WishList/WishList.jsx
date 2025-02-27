import React, { useContext, useEffect } from 'react';
import "./WishList.css";
import { WishlistContext } from '../../Context/WishlistContext';
import { ShopContext } from '../../Context/ShopContext';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { backend_url, currency } from '../../App';

const Wishlist = () => {
  const { wishlistItems, loading, error, removeFromWishlist, clearWishlist, addToCartFromWishlist } = useContext(WishlistContext);
  const shopContext = useContext(ShopContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      alert('请先登录以查看您的愿望单');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // 防止在重定向前显示内容
  }

  if (loading) {
    return <div className="loading">正在加载愿望单...</div>;
  }

  if (error) {
    return <div className="error">加载愿望单时出错: {error}</div>;
  }

  // 处理添加到购物车
  const handleAddToCart = async (item) => {
    await addToCartFromWishlist(item, shopContext);
  };

  // 移除项目
  const handleRemove = async (itemId) => {
    if (window.confirm('确定要从愿望单中移除此商品吗？')) {
      await removeFromWishlist(itemId);
    }
  };

  // 清空愿望单
  const handleClearWishlist = async () => {
    if (window.confirm('确定要清空愿望单吗？此操作无法撤销。')) {
      await clearWishlist();
    }
  };

  return (
    <div className="wishlist">
      <h2>我的愿望单</h2>
      <hr />
      
      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <p>您的愿望单为空。</p>
          <Link to="/">继续购物</Link>
        </div>
      ) : (
        <>
          <div className="wishlist-format-main">
            <span>商品</span>
            <span>价格</span>
            <span>促销</span>
            <span>操作</span>
          </div>
          
          {wishlistItems.map(item => (
            <div className="wishlist-format" key={item.id}>
              <div className="wishlist-product">
                <img
                  className="wishlist-product-icon"
                  src={item.img ? backend_url + item.img : "https://via.placeholder.com/55"}
                  alt={item.name}
                />
                <div className="wishlist-product-info">
                  <span className="wishlist-product-name">{item.name}</span>
                  {item.sku_id && (
                    <span className="wishlist-product-variant">
                      变体: {item.sku_id}
                    </span>
                  )}
                </div>
              </div>
              <div className="wishlist-price">
                {currency}{item.price.toFixed(2)}
              </div>
              <div className="wishlist-sale">
                {item.onSale ? (
                  <span className="sale-label">促销中!</span>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="wishlist-actions">
                <button 
                  className="btn-add-to-cart" 
                  onClick={() => handleAddToCart(item)}
                >
                  加入购物车
                </button>
                <button 
                  className="btn-remove" 
                  onClick={() => handleRemove(item.id)}
                >
                  移除
                </button>
              </div>
            </div>
          ))}
          
          <div className="wishlist-actions-bottom">
            <button 
              className="btn-clear-wishlist" 
              onClick={handleClearWishlist}
            >
              清空愿望单
            </button>
            <Link to="/" className="btn-continue-shopping">
              继续购物
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;