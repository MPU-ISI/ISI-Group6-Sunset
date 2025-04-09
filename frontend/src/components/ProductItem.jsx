import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const ProductItem = ({id,image,name,price,isOnPromotion,promotionPrice}) => {
    
    const {currency} = useContext(ShopContext);
    const {t} = useLanguage();

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className=' overflow-hidden'>
        <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      {isOnPromotion && promotionPrice ? (
        <div>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium text-red-600'>{currency}{promotionPrice}</p>
            <p className='text-xs line-through text-gray-500'>{currency}{price}</p>
          </div>
          <span className='bg-red-500 text-white text-xs px-1 py-0.5 rounded-sm'>{t('onSale')}</span>
        </div>
      ) : (
        <p className='text-sm font-medium'>{currency}{price}</p>
      )}
    </Link>
  )
}

export default ProductItem
