import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import kid_banner from "./Components/Assets/banner_kids.png";
import men_banner from "./Components/Assets/banner_mens.png";
import women_banner from "./Components/Assets/banner_women.png";
import FontSizeControl from "./Components/FontSizeControl/FontSizeControl";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import { AuthProvider } from "./Context/AuthContext";
import ShopContextProvider from "./Context/ShopContext";
import WishlistContextProvider from "./Context/WishlistContext";
import Cart from "./Pages/Cart";
import LoginSignup from "./Pages/LoginSignup";
import Product from "./Pages/Product";
import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/ShopCategory";
import WishList from "./Pages/WishList";
import UserOrders from './Components/UserOrders/UserOrders';

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
                <Route path="/login" element={<LoginSignup />} />
                <Route path="/orders" element={<UserOrders />} />
              </Routes>
              <Footer />
              <FontSizeControl />
            </Router>
          </WishlistContextProvider>
        </ShopContextProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
