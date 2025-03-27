import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import WishlistIcon from './WishlistIcon'

const ProductItem = ({ id, image, name, price }) => {
  const { currency, token } = useContext(ShopContext);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative group">
      <Link onClick={() => scrollTo(0, 0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
        <div className='overflow-hidden'>
          <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
        </div>
        <p className='pt-3 pb-1 text-sm'>{name}</p>
        <p className='text-sm font-medium'>{currency}{price}</p>
      </Link>
      <div 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={handleWishlistClick}
      >
        <WishlistIcon productId={id} token={token} />
      </div>
    </div>
  )
}

export default ProductItem
