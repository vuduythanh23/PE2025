import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { LoadingProvider } from "./context/LoadingContext";
import { NotificationProvider } from "./context/NotificationContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import UserProfile from "./pages/UserProfile";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./components/modules/Cart";
import NotificationBanner from "./components/modules/NotificationBanner";
import BackendStatusIndicator from "./components/modules/BackendStatusIndicator";
import { useCart } from "./context/CartContext";
import { isAuthenticated } from "./utils";

function AppContent() {
  const { isCartOpen, closeCart } = useCart();
  const location = useLocation();
  
  // Chỉ hiển thị BackendStatusIndicator trong trang admin
  const showBackendStatus = location.pathname === "/admin";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-luxury-forest/10 to-luxury-light/5">
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />{" "}
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />{" "}
      </Routes>{" "}
      <Cart isOpen={isCartOpen} onClose={closeCart} />
      <NotificationBanner />
      {showBackendStatus && <BackendStatusIndicator />}
    </div>
  );
}

export default function App() {
  return (
    <LoadingProvider>
      <Router>
        <CartProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </CartProvider>
      </Router>
    </LoadingProvider>
  );
}
