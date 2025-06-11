import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getUserCart } from "../utils/api/carts";
import { isAuthenticated } from "../utils";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  // Load cart từ backend API khi component mount
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated()) {
        setCartItems([]);
        setCartTotal(0);
        return;
      }

      try {
        const cart = await getUserCart();
        const items = cart.items || [];
        setCartItems(items);

        // Calculate total from cart items
        const total = items.reduce((sum, item) => {
          const price = item.salePrice || item.price || 0;
          const quantity = item.quantity || 0;
          return sum + price * quantity;
        }, 0);
        setCartTotal(total);
      } catch (error) {
        console.error("Error loading cart:", error);
        // Fallback to empty cart if API fails
        setCartItems([]);
        setCartTotal(0);
      }
    };

    loadCart();
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Hiệu ứng bounce khi thêm sản phẩm
  const animateCart = useCallback(() => {
    setIsCartBouncing(true);
    const timer = setTimeout(() => setIsCartBouncing(false), 500);
    return () => clearTimeout(timer);
  }, []);
  // Cập nhật giỏ hàng từ backend
  const updateCartItems = useCallback(async () => {
    if (!isAuthenticated()) {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    try {
      const cart = await getUserCart();
      const items = cart.items || [];
      setCartItems(items);

      // Calculate total from cart items
      const total = items.reduce((sum, item) => {
        const price = item.salePrice || item.price || 0;
        const quantity = item.quantity || 0;
        return sum + price * quantity;
      }, 0);
      setCartTotal(total);

      // Kích hoạt hiệu ứng bounce
      animateCart();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }, [animateCart]);

  // Lấy tổng số lượng sản phẩm trong giỏ
  const getTotalQuantity = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const quantity = parseInt(item?.quantity) || 0;
      return total + quantity;
    }, 0);
  }, [cartItems]);

  // Memoize value để tránh re-render không cần thiết
  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
