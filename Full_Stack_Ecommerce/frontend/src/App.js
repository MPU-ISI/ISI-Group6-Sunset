import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import WishList from "./Pages/WishList";
import Product from "./Pages/Product";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import women_banner from "./Components/Assets/banner_women.png";
import men_banner from "./Components/Assets/banner_mens.png";
import kid_banner from "./Components/Assets/banner_kids.png";
import LoginSignup from "./Pages/LoginSignup";
import WishlistContextProvider from "./Context/WishlistContext"; 
import ShopContextProvider from "./Context/ShopContext"; 

export const backend_url = 'http://localhost:4000';
export const currency = '$';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  // 检查localStorage中是否有token
  const isAuthenticated = localStorage.getItem('auth-token') ? true : false;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {

  return (
    <div>
      <AuthProvider>
        <ShopContextProvider>
          <WishlistContextProvider>
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<Shop gender="all" />} />
                <Route path="/mens" element={<ShopCategory banner={men_banner} category="men" />} />
                <Route path="/womens" element={<ShopCategory banner={women_banner} category="women" />} />
                <Route path="/kids" element={<ShopCategory banner={kid_banner} category="kid" />} />
                <Route path='/product' element={<Product />}>
                  <Route path=':productId' element={<Product />} />
                </Route>
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/wishList" element={<ProtectedRoute><WishList /></ProtectedRoute>} />
                <Route path="/login" element={<LoginSignup/>} />
              </Routes>
              <Footer />
            </Router>
          </WishlistContextProvider>
        </ShopContextProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
