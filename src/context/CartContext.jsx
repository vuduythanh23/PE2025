import { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { getCart, calculateCartTotal } from "../utils";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Khởi tạo giỏ hàng từ localStorage
  useEffect(() => {
    const items = getCart();
    setCartItems(items);
    setCartTotal(calculateCartTotal(items));
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  // Hiệu ứng bounce khi thêm sản phẩm
  const animateCart = useCallback(() => {
    setIsCartBouncing(true);
    const timer = setTimeout(() => setIsCartBouncing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Cập nhật giỏ hàng
  const updateCartItems = useCallback(() => {
    const items = getCart();
    setCartItems(items);
    setCartTotal(calculateCartTotal(items));
    // Kích hoạt hiệu ứng bounce
    animateCart();
  }, [animateCart]);

  // Lấy tổng số lượng sản phẩm trong giỏ
  const getTotalQuantity = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const quantity = parseInt(item?.quantity) || 0;
      return total + quantity;
    }, 0);
  }, [cartItems]);

  // Memoize value để tránh re-render không cần thiết
  const value = useMemo(() => ({
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    isCartBouncing,
    animateCart,
    cartItems,
    cartTotal,
    updateCartItems,
    getTotalQuantity,
  }), [
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    isCartBouncing,
    animateCart,
    cartItems,
    cartTotal,
    updateCartItems,
    getTotalQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
