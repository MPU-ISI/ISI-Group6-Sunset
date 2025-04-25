import React, { useContext, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import { FontSizeProvider, useFontSize } from './context/FontSizeContext'
import { LanguageProvider } from './context/LanguageContext'
import { ShopContext } from './context/ShopContext'
import About from './pages/About'
import Cart from './pages/Cart'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Login from './pages/Login'
import OrderDetail from './pages/OrderDetail'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Product from './pages/Product'
import Verify from './pages/Verify'
import Wishlist from './pages/Wishlist'

const AppContent = () => {
  const { fontSize } = useFontSize();
  const { checkWishlistPromotion, token, products, wishlistItems } = useContext(ShopContext);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  // 在应用加载时检查愿望单中是否有促销商品，但只在首页显示通知
  useEffect(() => {
    if (token && products.length > 0 && Object.keys(wishlistItems).length > 0) {
      // 只在首页路径("/")显示通知
      const showNotification = location.pathname === '/';
      checkWishlistPromotion(showNotification);
    }
  }, [token, products, wishlistItems, checkWishlistPromotion, location.pathname]);

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/order/:orderId' element={<OrderDetail />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/wishlist' element={<Wishlist />} />
      </Routes>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <FontSizeProvider>
        <AppContent />
      </FontSizeProvider>
    </LanguageProvider>
  );
};

export default App
