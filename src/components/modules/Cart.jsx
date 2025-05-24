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
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute right-0 h-full bg-white w-full max-w-md transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}-${index}`}
                    className="flex gap-4 border-b pb-4 animate-fade-in"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.size && `Size: ${item.size}`}
                        {item.color && ` | Color: ${item.color}`}
                      </p>
                      <p className="text-blue-600 font-medium">
                        {formatCurrency(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.size,
                              item.color,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveItem(
                              item.productId,
                              item.size,
                              item.color
                            )
                          }
                          className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t p-4 bg-white">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 transition-colors transform hover:scale-[1.02] 
                         active:scale-[0.98] duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Checkout"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
