import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [availableSizes, setAvailableSizes] = useState([]);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        
        // Extract sizes with stock
        if (item.sizes) {
          const available = Object.entries(item.sizes)
            .filter(([_, stock]) => stock > 0)
            .map(([size]) => size);
          setAvailableSizes(available);
        }
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  const handleAddToCart = () => {
    if (!size) {
      toast.error('Please select a size');
      return;
    }

    // Check if selected size has stock
    if (productData.sizes && productData.sizes[size] <= 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    addToCart(productData._id, size);
  }

  const checkStock = (sizeOption) => {
    if (productData.sizes && productData.sizes[sizeOption] !== undefined) {
      return productData.sizes[sizeOption] > 0;
    }
    return false;
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item,index)=>(
                  <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className=' flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_dull_icon} alt="" className="w-3 5" />
              <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {Object.keys(productData.sizes || {}).map((sizeOption, index) => {
                  const hasStock = checkStock(sizeOption);
                  return (
                    <button 
                      onClick={() => hasStock ? setSize(sizeOption) : toast.error('Size is out of stock')} 
                      className={`border py-2 px-4 ${hasStock ? 'bg-gray-100' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} 
                        ${sizeOption === size ? 'border-orange-500' : ''}`} 
                      key={index}
                      disabled={!hasStock}
                    >
                      {sizeOption}
                      {!hasStock && <span className="block text-xs text-red-500">Out of Stock</span>}
                    </button>
                  )
                })}
              </div>
              {availableSizes.length === 0 && (
                <p className="text-red-500 text-sm">All sizes are out of stock</p>
              )}
          </div>
          <button 
            onClick={handleAddToCart} 
            className={`bg-black text-white px-8 py-3 text-sm ${availableSizes.length === 0 ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-700'}`}
            disabled={availableSizes.length === 0}
          >
            Add to Cart
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Authentic Products.</p>
              <p>Cash on Delivery Available.</p>
              <p>Easy Returns within 7 Days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Product Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
