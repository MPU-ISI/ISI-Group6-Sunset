import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {
    const {currency, delivery_fee, getCartAmount} = useContext(ShopContext);
    const subtotal = getCartAmount();
    const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <div className='w-full bg-gray-50 p-4 rounded-md shadow-sm'>
      <div className='text-2xl mb-4'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-3 mt-3 text-sm'>
            <div className='flex justify-between items-center'>
                <p className='text-gray-600'>Subtotal</p>
                <p className='font-medium'>{currency} {subtotal.toFixed(2)}</p>
            </div>
            <hr className='border-gray-200' />
            <div className='flex justify-between items-center'>
                <p className='text-gray-600'>Shipping Fee</p>
                <p className='font-medium'>{currency} {delivery_fee.toFixed(2)}</p>
            </div>
            <hr className='border-gray-200' />
            <div className='flex justify-between items-center py-2'>
                <b className='text-lg'>Total</b>
                <b className='text-lg text-red-600'>{currency} {total.toFixed(2)}</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
