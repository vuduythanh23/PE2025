import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/format-utils";
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "../../utils/cart-utils";
import { createOrder } from "../../utils/api";
import { isAuthenticated } from "../../utils/auth-utils";
import Swal from "sweetalert2";

export default function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(getCart());
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId, size, color, newQuantity) => {
    const updatedCart = updateCartItemQuantity(
      productId,
      size,
      color,
      newQuantity
    );
    setCartItems([...updatedCart]);
  };

  const handleRemoveItem = (productId, size, color) => {
    const updatedCart = removeFromCart(productId, size, color);
    setCartItems([...updatedCart]);
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
      });

      if (!confirmed) {
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
      });

      onClose();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to place order",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${index}`}
                  className="flex gap-4 border-b pb-4"
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
                            Math.max(0, item.quantity - 1)
                          )
                        }
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="px-2 py-1 border rounded"
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
                        className="ml-auto text-red-500 hover:text-red-700"
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
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
