import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils";
import { getAvailableColorsForSize } from "../../utils/helpers/inventory";

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [availableColors, setAvailableColors] = useState([]);

  // Update available colors when component mounts or product changes
  useEffect(() => {
    if (product && isOpen) {
      // Initialize available colors (all colors available since no size is selected)
      setAvailableColors(
        product.colors?.map((c) => ({ ...c, isAvailable: c.stock > 0 })) || []
      );
    }
  }, [product, isOpen]);

  // Initialize selected color and image when product changes
  useEffect(() => {
    if (product && isOpen) {
      // Set first color as default if available
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
        // Set first image of first color if available
        if (product.colors[0].images && product.colors[0].images.length > 0) {
          setCurrentImage(product.colors[0].images[0]);
        } else {
          // Fallback to main product image
          setCurrentImage(
            product.images?.[0] || "/images/placeholder-product.jpg"
          );
        }
      } else {
        // No colors available, use main product image
        setCurrentImage(
          product.images?.[0] || "/images/placeholder-product.jpg"
        );
        setSelectedColor(null);
      }
    }
  }, [product, isOpen]);
  // Handle color selection with inventory constraints
  const handleColorSelect = (color) => {
    const colorData = availableColors.find((c) => c.color === color.color);
    if (colorData && colorData.isAvailable) {
      setSelectedColor(color);
      // Change image to first image of selected color
      if (color.images && color.images.length > 0) {
        setCurrentImage(color.images[0]);
      } else {
        // Fallback to main product image if color has no images
        setCurrentImage(
          product.images?.[0] || "/images/placeholder-product.jpg"
        );
      }
    }
  };

  // Handle view product details
  const handleViewDetails = () => {
    // Navigate to product detail page in the same tab
    window.location.href = `/product/${product._id}`;
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full h-[600px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>{" "}
        {/* Product Image - Fixed Height */}
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = "/images/placeholder-product.jpg";
            }}
          />
        </div>
        {/* Product Info */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          {/* Product Name and Brand */}
          <div className="mb-4">
            <h2 className="text-2xl font-serif text-luxury-dark mb-1">
              {product.name}
            </h2>
            <p className="text-luxury-gold font-medium">
              {product.brand || "Unknown Brand"}
            </p>
          </div>
          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-serif text-luxury-gold">
              {formatCurrency(product.price)}
            </span>
          </div>{" "}
          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-serif text-luxury-dark mb-3">
                Available Colors
              </h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color, index) => {
                  const colorData =
                    availableColors.find((c) => c.color === color.color) ||
                    color;
                  const isAvailable = colorData.isAvailable;

                  return (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color)}
                      disabled={!isAvailable}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                        selectedColor?.color === color.color
                          ? "border-luxury-gold bg-luxury-gold bg-opacity-10 text-luxury-gold"
                          : "border-gray-200 text-gray-600 hover:border-luxury-gold"
                      } ${
                        isAvailable
                          ? ""
                          : "opacity-40 cursor-not-allowed bg-gray-50"
                      }`}
                      title={`${color.color}${
                        !isAvailable ? " (Not available)" : ""
                      }`}
                    >
                      {/* Color dot if hexcode is available */}
                      {color.hexcode && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexcode }}
                        />
                      )}
                      <span className="text-sm font-medium">{color.color}</span>
                      {!isAvailable && (
                        <span className="text-xs text-red-400">(N/A)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}{" "}
          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto pt-4">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-luxury-gold text-white py-3 px-4 rounded-md font-serif text-sm tracking-wider hover:bg-luxury-dark transition-colors"
            >
              View Product Details
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
