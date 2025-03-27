import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {

    const [visible,setVisible] = useState(false);

    const {setShowSearch , getCartCount , navigate, token, setToken, setCartItems} = useContext(ShopContext);
    const { language, toggleLanguage, t } = useLanguage();

    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
    }

  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      
      <Link to='/'><img src={assets.logo} className='w-36' alt="" /></Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        
        <NavLink to='/' className='flex flex-col items-center gap-1'>
            <p>{t('home')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
            <p>{t('collection')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1'>
            <p>{t('about')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
            <p>{t('contact')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

      </ul>

      <div className='flex items-center gap-6'>
            <img onClick={()=> { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />
            
            {/* Language Toggle Button */}
            <button 
              onClick={toggleLanguage}
              className='px-3 py-1 text-sm border rounded hover:bg-gray-100'
            >
              {language === 'en' ? '中文' : 'EN'}
            </button>
            
            <div className='group relative'>
                <img onClick={()=> token ? null : navigate('/login') } className='w-5 cursor-pointer' src={assets.profile_icon} alt="" />
                {/* Dropdown Menu */}
                {token && 
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5  bg-slate-100 text-gray-500 rounded'>
                        <p className='cursor-pointer hover:text-black'>{t('profile')}</p>
                        <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-black'>{t('orders')}</p>
                        <p onClick={()=>navigate('/wishlist')} className='cursor-pointer hover:text-black'>Wishlist</p>
                        <p onClick={logout} className='cursor-pointer hover:text-black'>{t('logout')}</p>
                    </div>
                </div>}
            </div> 
            <Link 
              to={token ? '/wishlist' : '/login'}
              className='relative cursor-pointer'
              title="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Link>
            <div 
              onClick={() => token ? navigate('/cart') : navigate('/login')}
              className='relative cursor-pointer'
            >
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
            </div>
            <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" /> 
      </div>

        {/* Sidebar menu for small screens */}
        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>{language === 'en' ? 'Back' : '返回'}</p>
                    </div>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>{t('home')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>{t('collection')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>{t('about')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>{t('contact')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to={token ? '/wishlist' : '/login'}>Wishlist</NavLink>
                    <div 
                        onClick={()=> {
                            setVisible(false);
                            token ? navigate('/cart') : navigate('/login');
                        }} 
                        className='py-2 pl-6 border cursor-pointer flex items-center gap-2'
                    >
                        <img src={assets.cart_icon} className='w-4' alt="" />
                        <span>{language === 'en' ? 'CART' : '购物车'}</span>
                        <span className='ml-1 bg-black text-white w-4 h-4 text-center rounded-full text-xs'>
                            {getCartCount()}
                        </span>
                    </div>
                </div>
        </div>

    </div>
  )
}

export default Navbar
