import React, { useContext, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import cart_icon from '../Assets/cart_icon.png'
import logo from '../Assets/logo.png'
import nav_dropdown from '../Assets/nav_dropdown.png'
import './Navbar.css'

const Navbar = () => {

  let [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);

  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
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
        {localStorage.getItem('auth-token')
<<<<<<< HEAD
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace("/"); }}>Logout</button>
          : <Link to='/login' style={{ textDecoration: 'none' }}><button>Login</button></Link>}
        <Link to="/cart"><img src={cart_icon} alt="cart" /></Link>
=======
        ?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace("/");}}>Logout</button>
        :<Link to='/login' style={{ textDecoration: 'none' }}><button>Login</button></Link>}
        <img src={cart_icon} alt="cart" onClick={() => {
          if (!localStorage.getItem('auth-token')) {
            window.location.replace('/login');
          } else {
            window.location.replace('/cart');
          }
        }}/>
>>>>>>> f033aa26f85579e47be453bf9db75b19738b2501
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  )
}

export default Navbar

