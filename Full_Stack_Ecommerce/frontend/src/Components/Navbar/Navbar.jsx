import React, { useContext, useRef, useState } from 'react'
<<<<<<< HEAD
import { Link } from 'react-router-dom'
=======
import './Navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import wishlist_icon from '../Assets/wishlist_icon.jpg'
>>>>>>> d7069964b49e8e1ef6498dd8437c24e94e55b43e
import { ShopContext } from '../../Context/ShopContext'
import cart_icon from '../Assets/cart_icon.png'
import logo from '../Assets/logo.png'
import nav_dropdown from '../Assets/nav_dropdown.png'
import './Navbar.css'

const Navbar = () => {
<<<<<<< HEAD

  let [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
=======
  let [menu, setMenu] = useState("shop");
  const { cartItems } = useContext(ShopContext);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
>>>>>>> d7069964b49e8e1ef6498dd8437c24e94e55b43e

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
<<<<<<< HEAD
        {localStorage.getItem('auth-token')
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace("/"); }}>Logout</button>
          : <Link to='/login' style={{ textDecoration: 'none' }}><button>Login</button></Link>}
        <img src={cart_icon} alt="cart" onClick={() => {
          if (!localStorage.getItem('auth-token')) {
            window.location.replace('/login');
          } else {
            window.location.replace('/cart');
          }
        }} />
        <div className="nav-cart-count">{getTotalCartItems()}</div>
=======
        {isAuthenticated ? (
          <>
            {user && <span className="welcome-text">欢迎, {user.firstName || user.userName || '用户'}</span>}
            <button onClick={logout}>Logout</button>
            <Link to="/cart"><img src={cart_icon} alt="cart" /></Link>
            <div className="nav-cart-count">{getCartItemCount()}</div>
            <Link to="/wishList"><img src={wishlist_icon} alt="wishList" /></Link>
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
>>>>>>> d7069964b49e8e1ef6498dd8437c24e94e55b43e
      </div>
    </div>
  )
}

export default Navbar