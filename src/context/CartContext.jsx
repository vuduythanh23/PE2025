import { createContext, useState, useContext, useEffect } from "react";
import { getCart } from "../utils/cart-utils";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Initialize cart items
  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const animateCart = () => {
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 1000); // Animation duration
  };

  const updateCartItems = () => {
    setCartItems(getCart());
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    isCartBouncing,
    animateCart,
    cartItems,
    updateCartItems,
    getTotalQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
