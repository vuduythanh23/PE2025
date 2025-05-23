import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import UserProfile from "./pages/UserProfile";
import Products from "./pages/Products";
import Cart from "./components/modules/Cart";
import { useCart } from "./context/CartContext";

function AppContent() {
  const { isCartOpen, closeCart } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/products" element={<Products />} />
      </Routes>
      <Cart isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}
