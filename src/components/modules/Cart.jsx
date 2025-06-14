import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatCurrency,
  createOrder,
  isAuthenticated,
  updateItemQuantity,
  removeItemFromCart,
  clearUserCart,
} from "../../utils";
import { useCart } from "../../context/CartContext";
import Swal from "sweetalert2";

// Component hiển thị từng sản phẩm trong giỏ hàng
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  // Xử lý khi hình ảnh lỗi
  const handleImageError = (e) => {
    e.target.src = "/images/product-placeholder.png";
    e.target.onerror = null;
  };

  return (
    <div className="flex gap-4 pb-4 border-b border-luxury-gold/10 last:border-0">
      <img
        src={item.images?.[0] || "/images/product-placeholder.png"}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
        onError={handleImageError}
      />
      <div className="flex-1">
        <h3 className="font-serif text-luxury-dark">{item.name}</h3>
        <p className="text-sm text-luxury-dark/70 mt-1">
          {item.color && `Color: ${item.color}`}
          {item.size && ` | Size: ${item.size}`}
        </p>{" "}        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newQuantity = Math.max(0, item.quantity - 1);
                console.log("➖ Decreasing quantity from", item.quantity, "to", newQuantity);
                onQuantityChange(newQuantity);
              }}
              className="w-8 h-8 flex items-center justify-center border border-luxury-gold/30 rounded hover:bg-luxury-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="font-serif text-luxury-dark w-12 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => {
                const newQuantity = Math.min(item.stock || 99, item.quantity + 1);
                console.log("➕ Increasing quantity from", item.quantity, "to", newQuantity);
                onQuantityChange(newQuantity);
              }}
              className="w-8 h-8 flex items-center justify-center border border-luxury-gold/30 rounded hover:bg-luxury-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.quantity >= (item.stock || 99)}
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-serif text-luxury-gold">
                {formatCurrency((item.salePrice || item.price) * item.quantity)}
              </span>
              {item.salePrice && item.salePrice < item.price && (
                <div className="text-sm text-gray-500 line-through">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              )}
            </div>
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
  }, [isOpen, updateCartItems]);  const handleQuantityChange = async (productId, size, color, newQuantity) => {
    console.log("🔄 Updating quantity:", { productId, size, color, newQuantity });
    
    // Validate input
    if (!productId) {
      console.error("❌ Missing productId");
      Swal.fire({
        title: "Error",
        text: "Product ID is missing. Please try again.",
        icon: "error",
      });
      return;
    }
    
    if (newQuantity === undefined || newQuantity === null || newQuantity < 0) {
      console.error("❌ Invalid quantity:", newQuantity);
      Swal.fire({
        title: "Error",
        text: "Invalid quantity. Please try again.",
        icon: "error",
      });
      return;
    }

    // If quantity is 0, remove the item instead
    if (newQuantity === 0) {
      console.log("🗑️ Quantity is 0, removing item instead");
      await handleRemoveItem(productId, size, color);
      return;
    }

    try {
      const updateData = {
        productId: productId,
        quantity: newQuantity,
        selectedSize: size || null,
        selectedColor: color || null,
      };
      
      console.log("📤 Sending update request:", updateData);
      
      // Try to update via API
      await updateItemQuantity(updateData);
      
      console.log("✅ Quantity updated successfully via API");
      updateCartItems();
    } catch (error) {
      console.error("❌ API update failed:", error);
      
      // Fallback: Update localStorage directly if API fails
      try {
        console.log("🔄 Falling back to localStorage update...");
        
        const cartKey = 'cart';
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        
        // Find and update the item in localStorage
        const updatedCart = existingCart.map(cartItem => {
          const matches = (
            (cartItem.productId === productId || cartItem._id === productId) &&
            (cartItem.selectedSize || cartItem.size) === size &&
            (cartItem.selectedColor || cartItem.color) === color
          );
          
          if (matches) {
            console.log("📝 Updating item in localStorage:", cartItem);
            return { ...cartItem, quantity: newQuantity };
          }
          return cartItem;
        });
        
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        updateCartItems();
        
        console.log("✅ Quantity updated successfully via localStorage fallback");
        
        // Show warning about API failure
        Swal.fire({
          title: "Updated (Offline Mode)",
          text: "Quantity updated locally. Changes will sync when connection is restored.",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
        });
        
      } catch (fallbackError) {
        console.error("❌ Fallback update also failed:", fallbackError);
        Swal.fire({
          title: "Error",
          text: `Failed to update quantity: ${error.message || error}`,
          icon: "error",
        });
      }
    }
  };

  const handleRemoveItem = async (productId, size, color) => {
    try {
      await removeItemFromCart({
        productId: productId,
        selectedSize: size,
        selectedColor: color,
      });
      updateCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to remove item. Please try again.",
        icon: "error",
      });
    }
  };  const handleCheckout = async () => {
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

    // Simply navigate to checkout page which will handle the order creation
    onClose();
    navigate("/checkout");
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
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
            <h2 className="font-serif text-2xl text-luxury-dark">
              Shopping Cart
            </h2>
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
                {" "}
                {cartItems.map((item, index) => {
                  // Handle backend cart structure: item might have product field
                  const product = item.product || item;
                  const itemKey = `${product._id || item.productId}-${
                    item.selectedSize || item.size || "no-size"
                  }-${item.selectedColor || item.color || "no-color"}-${index}`;

                  return (
                    <CartItem
                      key={itemKey}
                      item={{
                        ...product,
                        quantity: item.quantity,
                        size: item.selectedSize || item.size,
                        color: item.selectedColor || item.color,
                        price: item.price || product.price,
                        salePrice: item.salePrice || product.salePrice,
                      }}
                      onQuantityChange={(newQuantity) =>
                        handleQuantityChange(
                          product._id || item.productId,
                          item.selectedSize || item.size,
                          item.selectedColor || item.color,
                          newQuantity
                        )
                      }
                      onRemove={() =>
                        handleRemoveItem(
                          product._id || item.productId,
                          item.selectedSize || item.size,
                          item.selectedColor || item.color
                        )
                      }
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
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-luxury-dark transition-colors"
                  }`}
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
