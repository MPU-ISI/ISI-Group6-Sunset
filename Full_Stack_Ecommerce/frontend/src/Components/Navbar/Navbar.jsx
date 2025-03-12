import React, { useContext, useRef, useState } from 'react'
import './Navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import wishlist_icon from '../Assets/wishlist_icon.jpg'
import { ShopContext } from '../../Context/ShopContext'
import nav_dropdown from '../Assets/nav_dropdown.png'
import { WishlistContext } from '../../Context/WishlistContext'

const Navbar = () => {
  let [menu, setMenu] = useState("shop");
  const { cartItems } = useContext(ShopContext);
  const { wishtlistItems } = useContext(WishlistContext);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  // 处理禁用链接的点击
  const handleDisabledLinkClick = () => {
    alert('请先登录');
    navigate('/login');
  }
  
  // 获取购物车商品总数
  const getCartItemCount = () => {
    return cartItems && Array.isArray(cartItems) ? cartItems.length : 0;
  }

  const getWishlistCount = () => {
    return wishtlistItems && Array.isArray(wishtlistItems) ? wishtlistItems.length : 0;
  }

  return (
    <div className='nav'>
      <Link to='/' onClick={() => { setMenu("shop") }} style={{ textDecoration: 'none' }} className="nav-logo">
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </Link>
      <img onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => { setMenu("shop") }}><Link to='/' style={{ textDecoration: 'none' }}>Shop</Link>{menu === "shop" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("mens") }}><Link to='/mens' style={{ textDecoration: 'none' }}>Men</Link>{menu === "mens" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("womens") }}><Link to='/womens' style={{ textDecoration: 'none' }}>Women</Link>{menu === "womens" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("kids") }}><Link to='/kids' style={{ textDecoration: 'none' }}>Kids</Link>{menu === "kids" ? <hr /> : <></>}</li>
      </ul>
      <div className="nav-login-cart">
        {isAuthenticated ? (
          <>
            {user && <span className="welcome-text">欢迎, {user.firstName || user.userName || '用户'}</span>}
            <button onClick={logout}>Logout</button>
            <Link to="/cart"><img src={cart_icon} alt="cart" /></Link>
            <div className="nav-cart-count">{getCartItemCount()}</div>
            <Link to="/wishList"><img src={wishlist_icon} alt="wishList" /></Link>
            <div className="nav-wishlist-count">{getWishlistCount()}</div>
          </>
        ) : (
          <>
            <Link to='/login' style={{ textDecoration: 'none' }}><button>Login</button></Link>
            <div 
              className="disabled-link" 
              onClick={handleDisabledLinkClick}
              title="请先登录"
            >
              <img src={cart_icon} alt="cart" style={{ opacity: 0.5, filter: 'grayscale(70%)' }}/>
            </div>
            <div 
              className="disabled-link" 
              onClick={handleDisabledLinkClick}
              title="请先登录"
            >
              <img src={wishlist_icon} alt="wishList" style={{ opacity: 0.5, filter: 'grayscale(70%)' }}/>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar