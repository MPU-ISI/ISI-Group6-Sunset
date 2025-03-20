import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      setIsLoading(false);
      const tempData = [];
      for (const items in cartItems) {
        const productExists = products.find(p => p._id === items);
        if (!productExists) continue;

        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const sizeAvailable = productExists.sizes && productExists.sizes[item] > 0;
            if (sizeAvailable) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item]
              });
            }
          }
        }
      }
      setCartData(tempData);
      console.log("Cart data processed:", tempData);
      console.log("Original cart items:", cartItems);
      console.log("Available products:", products);
    }
  }, [cartItems, products])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        <div className='flex flex-col items-center justify-center min-h-[40vh] gap-4'>
          <img src={assets.empty_cart} alt="Empty Cart" className='w-32 h-32' />
          <p className='text-gray-500 text-lg'>Your cart is empty</p>
          <button 
            onClick={() => navigate('/')} 
            className='bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors'
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartData.map((item, index) => {
              const productData = products.find((product) => product._id === item._id);
              if (!productData) return null;

              return (
                <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className='flex items-start gap-6'>
                    <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
                    <div className="flex flex-col gap-1">
                      <p 
                        className='text-xs sm:text-lg font-medium cursor-pointer hover:text-blue-600'
                        onClick={() => navigate(`/product/${item._id}`)}
                      >
                        {productData.name}
                      </p>
                      <div className='flex flex-col gap-1 mt-1'>
                        <p><span className="text-gray-500">Price:</span> {currency}{productData.price}</p>
                        <p><span className="text-gray-500">Size:</span> {item.size}</p>
                        <p><span className="text-gray-500">Quantity:</span> {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <input 
                    onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} 
                    className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                    type="number" 
                    min={1} 
                    defaultValue={item.quantity} 
                  />
                  <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
                </div>
              )
            })}
          </div>

          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-[450px]'>
              <CartTotal />
              <div className='w-full text-end'>
                <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
