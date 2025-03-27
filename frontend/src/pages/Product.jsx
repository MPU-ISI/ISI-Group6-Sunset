import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, navigate, addToWishlist, removeFromWishlist, isInWishlist } = useContext(ShopContext);
  const { t } = useLanguage();
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [cartSize, setCartSize] = useState('');
  const [showWishlistSizes, setShowWishlistSizes] = useState(false);
  const [wishlistSize, setWishlistSize] = useState('');

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  const handleAddToCart = () => {
    if (!token) {
      toast.info(t('pleaseLoginToAddToCart'));
      navigate('/login');
      return;
    }

    if (!cartSize) {
      toast.error(t('pleaseSelectSize'));
      return;
    }

    // Check if selected size has stock
    if (productData.sizes && productData.sizes[cartSize] <= 0) {
      toast.error(t('selectedSizeOutOfStock'));
      return;
    }

    addToCart(productData._id, cartSize);
  }

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info(t('pleaseLoginToAddToWishlist'));
      return;
    }

    if (!wishlistSize) {
      setShowWishlistSizes(true);
      return;
    }

    try {
      await addToWishlist(productId, wishlistSize);
      setShowWishlistSizes(false);
      setWishlistSize('');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(t('failedToUpdateWishlist'));
    }
  };

  const handleRemoveFromWishlist = async (size) => {
    try {
      await removeFromWishlist(productId, size);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(t('failedToUpdateWishlist'));
    }
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item,index)=>(
              <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='text-2xl font-medium mb-4'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='text-xl font-medium mb-6'>${productData.price}</p>
          <p className='text-gray-500 md:w-4/5 mb-8'>{productData.description}</p>
          
          <div className='mb-6'>
            <h3 className='font-medium mb-2'>{t('selectSize')}</h3>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(productData.sizes || {}).map((sizeOption, index) => {
                const hasStock = productData.sizes[sizeOption] > 0;
                const isInWishlistWithSize = isInWishlist(productId, sizeOption);
                return (
                  <button 
                    onClick={() => setCartSize(sizeOption)} 
                    className={`relative border py-2 px-4 ${
                      sizeOption === cartSize ? 'border-orange-500' : 
                      hasStock ? 'bg-gray-100' : 'bg-gray-200 text-gray-500'
                    }`} 
                    key={index}
                  >
                    {sizeOption}
                    {!hasStock && <span className="block text-xs text-red-500">{t('outOfStock')}</span>}
                    {isInWishlistWithSize && (
                      <span className="absolute -top-1 -right-1">
                        <FaHeart className="text-red-500 text-sm" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='flex gap-4'>
            <button 
              onClick={handleAddToCart} 
              className='flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors'
            >
              {t('addToCart')}
            </button>
            
            <div className='relative'>
              <button
                onClick={handleAddToWishlist}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:border-black transition-colors"
                title={t('addToWishlist')}
              >
                <FaRegHeart className="text-gray-500 hover:text-red-500 text-xl" />
              </button>

              {/* Wishlist Size Selection Popup */}
              {showWishlistSizes && (
                <div className='absolute top-full right-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]'>
                  <p className='text-sm font-medium mb-2'>{t('Select Size')}</p>
                  <div className='flex flex-wrap gap-2'>
                    {Object.keys(productData.sizes || {}).map((sizeOption, index) => {
                      const isInWishlistWithSize = isInWishlist(productId, sizeOption);
                      return (
                        <button 
                          key={index}
                          onClick={() => {
                            if (isInWishlistWithSize) {
                              handleRemoveFromWishlist(sizeOption);
                            } else {
                              setWishlistSize(sizeOption);
                            }
                          }}
                          className={`border py-1 px-3 text-sm ${
                            isInWishlistWithSize ? 'bg-red-50 border-red-200 text-red-500' :
                            sizeOption === wishlistSize ? 'border-orange-500' : ''
                          }`}
                        >
                          {sizeOption}
                          {isInWishlistWithSize && (
                            <FaHeart className="inline ml-1 text-red-500 text-xs" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className='flex justify-end gap-2 mt-3'>
                    <button 
                      onClick={() => {
                        setShowWishlistSizes(false);
                        setWishlistSize('');
                      }}
                      className='text-sm text-gray-500 hover:text-gray-700'
                    >
                      {t('cancel')}
                    </button>
                    <button 
                      onClick={handleAddToWishlist}
                      className='text-sm text-blue-500 hover:text-blue-700'
                      disabled={!wishlistSize}
                    >
                      {t('confirm')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>{t('authentic')}</p>
            <p>{t('cashOnDelivery')}</p>
            <p>{t('easyReturns')}</p>
          </div>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>{t('productDescription')}</b>
          <p className='border px-5 py-3 text-sm'>{t('reviews')} (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className='opacity-0'></div>
}

export default Product
