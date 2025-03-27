import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const WishlistIcon = ({ productId, token, onUpdate, size = null, showSizeSelector = false, availableSizes = [], productSizes = {} }) => {
  const { backendUrl } = useContext(ShopContext);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(size);
  const [showSizes, setShowSizes] = useState(false);

  useEffect(() => {
    setSelectedSize(size);
  }, [size]);

  useEffect(() => {
    if (!token || !productId) return;
    
    const checkWishlist = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/wishlist/check/${productId}`,
          { headers: { token } }
        );
        
        if (response.data.success) {
          setInWishlist(response.data.inWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };
    
    checkWishlist();
  }, [productId, token, backendUrl]);

  const toggleWishlist = async (e) => {
    if (e) e.stopPropagation();

    if (!token) {
      toast.info('Please login to add items to your wishlist');
      return;
    }
    
    // 如果需要选择尺码但还没选择
    if (!inWishlist && showSizeSelector && !selectedSize) {
      setShowSizes(true);
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      if (inWishlist) {
        response = await axios.post(
          `${backendUrl}/api/wishlist/remove`,
          { productId },
          { headers: { token } }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/wishlist/add`,
          { 
            productId, 
            size: selectedSize || size 
          },
          { headers: { token } }
        );
      }
      
      if (response.data.success) {
        setInWishlist(!inWishlist);
        toast.success(response.data.message);
        if (onUpdate) onUpdate();
        setShowSizes(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSizeSelect = (sizeOption, e) => {
    e.stopPropagation();
    setSelectedSize(sizeOption);
    addToWishlistWithSize(sizeOption);
  };

  const addToWishlistWithSize = async (sizeOption) => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { 
          productId, 
          size: sizeOption 
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        setInWishlist(true);
        toast.success(response.data.message);
        if (onUpdate) onUpdate();
        setShowSizes(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 使用 availableSizes 如果提供了，否则使用 productSizes
  const sizesToDisplay = availableSizes.length > 0 ? availableSizes : Object.keys(productSizes || {});

  return (
    <div className="relative">
      <div
        onClick={toggleWishlist}
        className={`cursor-pointer transition-all duration-300 ${loading ? 'opacity-50' : 'hover:scale-110'}`}
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {inWishlist ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="w-6 h-6">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )}
      </div>
      
      {showSizes && showSizeSelector && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10 p-2 min-w-[150px]">
          <div className="text-sm font-medium mb-2">Select Size:</div>
          <div className="grid grid-cols-3 gap-1">
            {sizesToDisplay.map((sizeOption) => (
              <button
                key={sizeOption}
                onClick={(e) => handleSizeSelect(sizeOption, e)}
                className={`border py-1 px-2 text-xs ${
                  selectedSize === sizeOption ? 'border-black bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {sizeOption}
              </button>
            ))}
          </div>
          <div className="text-right mt-2">
            <button 
              onClick={(e) => {e.stopPropagation(); setShowSizes(false);}}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistIcon; 