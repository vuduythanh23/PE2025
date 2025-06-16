import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, addItemToCart } from "../../utils";
import { useCart } from "../../context/CartContext";
import { useNotification } from "../../context/NotificationContext";
import Swal from "sweetalert2";

export default function AddToCartModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const { animateCart, updateCartItems } = useCart();
  const { addNotification } = useNotification();

  const {
    _id = "",
    name = "",
    price = 0,
    images = [],
    colors = [],
    sizes = [],
    stock = 0,
  } = product || {};

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize(sizes?.[0]?.size || "");
      setSelectedColor(colors?.[0]?.color || "");
      setQuantity(1);
    }
  }, [isOpen, product, sizes, colors]);

  // Get the first valid image URL or use a fallback
  const productImage =
    images && images.length > 0 ? images[0] : "/images/placeholder-product.jpg";

  const handleAddToCart = async () => {
    try {
      setLoading(true);

      // Validation
      if (sizes.length > 0 && !selectedSize) {
        await Swal.fire({
          title: "Size Required",
          text: "Please select a size",
          icon: "warning",
        });
        return;
      }

      if (colors.length > 0 && !selectedColor) {
        await Swal.fire({
          title: "Color Required",
          text: "Please select a color",
          icon: "warning",
        });
        return;
      }

      if (quantity < 1 || quantity > stock) {
        await Swal.fire({
          title: "Invalid Quantity",
          text: `Please enter a quantity between 1 and ${stock}`,
          icon: "warning",
        });
        return;
      } // Add product to cart using backend API
      await addItemToCart({
        productId: _id,
        quantity: parseInt(quantity),
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
      });

      // Update cart UI
      updateCartItems();
      animateCart();

      // Show success message
      addNotification(`${name} added to cart!`, "success");

      // Close modal and call success callback
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ Add to cart error:", error);

      await Swal.fire({
        title: "Error",
        text: "Failed to add product to cart. Please try again.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !product) {
    return null;
  }
  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif text-luxury-dark font-semibold">
            Add to Cart
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        {/* Product Info */}
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <img
              src={productImage}
              alt={name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-serif text-lg text-luxury-dark">{name}</h3>
              <p className="text-luxury-gold font-serif text-xl font-bold">
                {formatCurrency(price)}
              </p>
              <p className="text-sm text-gray-600">{stock} in stock</p>
            </div>
          </div>

          {/* Size Selection */}
          {sizes && sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-luxury-dark mb-3">
                Size <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((sizeOption, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`p-2 text-sm border rounded-md transition-all duration-200 ${
                      selectedSize === sizeOption.size
                        ? "border-luxury-gold bg-luxury-gold text-white"
                        : "border-gray-300 hover:border-luxury-gold"
                    }`}
                  >
                    {sizeOption.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colors && colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-luxury-dark mb-3">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((colorOption, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(colorOption.color)}
                    className={`px-4 py-2 text-sm border rounded-md transition-all duration-200 ${
                      selectedColor === colorOption.color
                        ? "border-luxury-gold bg-luxury-gold text-white"
                        : "border-gray-300 hover:border-luxury-gold"
                    }`}
                  >
                    {colorOption.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-luxury-dark mb-3">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:border-luxury-gold transition-colors"
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(stock, Math.max(1, val)));
                }}
                className="w-16 text-center border border-gray-300 rounded-md py-1"
                min="1"
                max={stock}
              />
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:border-luxury-gold transition-colors"
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-luxury-dark font-medium">Total:</span>
              <span className="text-luxury-gold font-serif text-xl font-bold">
                {formatCurrency(price * quantity)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 bg-luxury-gold text-white rounded-md hover:bg-luxury-dark transition-colors disabled:opacity-50"
              disabled={loading || stock === 0}
            >
              {loading ? "Adding..." : "Add to Cart"}
            </button>{" "}
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render modal at document root level
  return createPortal(modalContent, document.body);
}
