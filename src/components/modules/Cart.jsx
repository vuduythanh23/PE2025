import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatCurrency,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrder,
  isAuthenticated,
} from "../../utils";
import { useCart } from "../../context/CartContext";
import Swal from "sweetalert2";

// Component hiển thị từng sản phẩm trong giỏ hàng
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  // Xử lý khi hình ảnh lỗi
  const handleImageError = (e) => {
    e.target.src = '/images/product-placeholder.png';
    e.target.onerror = null;
  };

  return (
    <div className="flex gap-4 pb-4 border-b border-luxury-gold/10 last:border-0">
      <img
        src={item.images?.[0] || '/images/product-placeholder.png'}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
        onError={handleImageError}
      />
      <div className="flex-1">
        <h3 className="font-serif text-luxury-dark">{item.name}</h3>
        <p className="text-sm text-luxury-dark/70 mt-1">
          {item.color && `Color: ${item.color}`}
          {item.size && ` | Size: ${item.size}`}
        </p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(Math.max(0, item.quantity - 1))}
              className="text-luxury-dark/70 hover:text-luxury-gold transition-colors"
            >
              -
            </button>
            <span className="font-serif text-luxury-dark w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(Math.min(item.stock, item.quantity + 1))}
              className="text-luxury-dark/70 hover:text-luxury-gold transition-colors"
              disabled={item.quantity >= item.stock}
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-serif text-luxury-gold">
              {formatCurrency(item.price * item.quantity)}
            </span>
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-600 transition-colors"
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cartItems, cartTotal, updateCartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      updateCartItems();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, updateCartItems]);

  const handleQuantityChange = (productId, size, color, newQuantity) => {
    updateCartItemQuantity(productId, size, color, newQuantity);
    updateCartItems();
  };

  const handleRemoveItem = (productId, size, color) => {
    removeFromCart(productId, size, color);
    updateCartItems();
  };

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      const result = await Swal.fire({
        title: "Login Required",
        text: "Please login to proceed with checkout",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      if (result.isConfirmed) {
        onClose();
        navigate("/login?redirect=/checkout");
      }
      return;
    }

    try {
      setLoading(true);
      const order = await createOrder(cartItems);
      if (order) {
        clearCart();
        updateCartItems();
        onClose();
        Swal.fire({
          title: "Order Placed Successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/profile");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to place order. Please try again.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-luxury-gold/10 p-4">
            <h2 className="font-serif text-2xl text-luxury-dark">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-luxury-dark/70 hover:text-luxury-gold transition-colors"
              aria-label="Close cart"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!cartItems || cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <p className="text-luxury-dark/70 mb-4">Your cart is empty</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/products");
                  }}
                  className="text-luxury-gold hover:text-luxury-dark transition-colors font-serif"
                >
                  Continue Shopping &rarr;
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {cartItems.map((item, index) => {
                  // Tạo unique key bằng cách kết hợp nhiều thuộc tính
                  const itemKey = `${item._id}-${item.size || 'no-size'}-${item.color || 'no-color'}-${index}`;
                  return (
                    <CartItem
                      key={itemKey}
                      item={item}
                      onQuantityChange={(newQuantity) =>
                        handleQuantityChange(item._id, item.size, item.color, newQuantity)
                      }
                      onRemove={() => handleRemoveItem(item._id, item.size, item.color)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {cartItems && cartItems.length > 0 && (
            <div className="border-t border-luxury-gold/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-serif text-luxury-dark">Total</span>
                <span className="font-serif text-2xl text-luxury-gold">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full bg-luxury-gold text-white py-3 px-6 rounded-md font-serif
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-luxury-dark transition-colors'}`}
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
