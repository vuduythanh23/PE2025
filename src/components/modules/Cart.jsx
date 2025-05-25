import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/format-utils";
import {
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "../../utils/cart-utils";
import { createOrder } from "../../utils/api";
import { isAuthenticated } from "../../utils/auth-utils";
import { useCart } from "../../context/CartContext";
import Swal from "sweetalert2";

export default function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cartItems, updateCartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      updateCartItems(); // Update cart items when opened
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

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to proceed with checkout",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        backdrop: "rgba(0, 0, 0, 0.7)",
        customClass: {
          container: "sweetalert-dialog",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    try {
      setLoading(true);

      // Show demo transaction dialog
      const { value: confirmed } = await Swal.fire({
        title: "Demo Transaction",
        html: `
          <div class="text-left">
            <p class="mb-4">Total Amount: ${formatCurrency(
              calculateTotal()
            )}</p>
            <p class="mb-2">This is a demo transaction. In a real application:</p>
            <ul class="list-disc pl-5">
              <li>Payment gateway would be integrated</li>
              <li>Real payment would be processed</li>
              <li>Transaction details would be verified</li>
            </ul>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Confirm Order",
        cancelButtonText: "Cancel",
        icon: "info",
        backdrop: "rgba(0, 0, 0, 0.7)",
        customClass: {
          container: "sweetalert-dialog",
        },
      });

      if (!confirmed) {
        setLoading(false);
        return;
      }

      // Create order with status "processing"
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        totalAmount: calculateTotal(),
        status: "processing",
      };

      await createOrder(orderData);

      // Clear cart after successful order
      clearCart();
      setCartItems([]);

      Swal.fire({
        title: "Order Placed Successfully!",
        text: "Your order is being processed",
        icon: "success",
        confirmButtonText: "OK",
        backdrop: "rgba(0, 0, 0, 0.7)",
        customClass: {
          container: "sweetalert-dialog",
        },
      });

      onClose();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to place order",
        icon: "error",
        backdrop: "rgba(0, 0, 0, 0.7)",
        customClass: {
          container: "sweetalert-dialog",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-6 border-b border-luxury-gold/20">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-luxury-dark">
                Shopping Cart
              </h2>
              <button
                onClick={onClose}
                className="text-luxury-dark/70 hover:text-luxury-gold transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="text-lg font-serif text-luxury-dark/70 mb-4">
                  Your cart is empty
                </p>
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
                {cartItems.map((item, index) => (
                  <div
                    key={`${item._id}-${item.size}-${item.color}-${index}`}
                    className="flex gap-4 pb-4 border-b border-luxury-gold/10 last:border-0"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-serif text-luxury-dark">
                        {item.name}
                      </h3>
                      <p className="text-sm text-luxury-dark/70 mt-1">
                        {item.color && `Color: ${item.color}`}
                        {item.size && ` | Size: ${item.size}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.size,
                                item.color,
                                Math.max(0, item.quantity - 1)
                              )
                            }
                            className="text-luxury-dark/70 hover:text-luxury-gold transition-colors"
                          >
                            -
                          </button>
                          <span className="font-serif text-luxury-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            className="text-luxury-dark/70 hover:text-luxury-gold transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-serif text-luxury-gold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleRemoveItem(item._id, item.size, item.color)
                      }
                      className="text-luxury-dark/50 hover:text-luxury-gold transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-luxury-gold/20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-serif text-luxury-dark">
                  Total
                </span>
                <span className="text-xl font-serif text-luxury-gold">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full bg-luxury-gold text-white py-3 font-serif text-sm tracking-wider transition-colors
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-luxury-dark"
                  }`}
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
                className="w-full text-luxury-dark/70 hover:text-luxury-gold py-3 mt-3 font-serif text-sm tracking-wider transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
