import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { token, currency, addToCart, backendUrl } = useContext(ShopContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [token, backendUrl]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/wishlist/get`,
        { headers: { token } }
      );
      
      if (response.data.success && response.data.wishlist) {
        const items = response.data.wishlist.products || [];
        setWishlistItems(items.map(item => ({
          ...item,
          productId: item._id,
          size: item.details.size,
          inStock: item.details.sizes && item.details.sizes[item.size] > 0
        })));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId: itemId },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success('Item removed from wishlist');
        fetchWishlist();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your wishlist?')) return;
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/clear`,
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success('Wishlist cleared');
        fetchWishlist();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist. Please try again.');
    }
  };

  const handleAddToCart = async (item) => {
    if (!item.inStock) {
      toast.error(`${item.details.name} (Size: ${item.size}) is out of stock`);
      return;
    }
    
    // 添加到购物车
    addToCart(item.productId, item.size);
    
    // 从愿望单中删除
    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId: item.productId },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(`${item.details.name} (Size: ${item.size}) added to cart and removed from wishlist`);
        fetchWishlist(); // 刷新愿望单列表
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title text="My Wishlist" />
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Your wishlist is empty</p>
          <Link to="/shop" className="text-blue-500 hover:underline mt-4 inline-block">
            Go Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                {item.details ? (
                  <>
                    <Link to={`/product/${item.productId}`}>
                      <img 
                        src={item.details.image[0]} 
                        alt={item.details.name}
                        className="w-full h-64 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${item.productId}`}>
                        <h3 className="text-lg font-medium mb-2">{item.details.name}</h3>
                      </Link>
                      <p className="text-gray-600 mb-2">Size: {item.size}</p>
                      <p className="text-lg font-medium mb-4">{currency}{item.details.price}</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className={`px-4 py-2 rounded ${
                            item.inStock
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!item.inStock}
                        >
                          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4">
                    <p className="text-gray-500">Product information unavailable</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={clearWishlist}
              className="text-red-500 hover:text-red-600 underline"
            >
              Clear Wishlist
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist; 