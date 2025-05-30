  import { formatCurrency, addToCart, isAuthenticated } from "../../utils";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ProductCard(props) {
  const {
    _id = "",
    name = "",
    description = "",
    price = 0,
    images = [],
    category = "",
    brand = "",
    colors = [],
    sizes = [],
    stock = 0,
    averageRating = 0,
  } = props;

  const { animateCart, updateCartItems } = useCart();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(colors?.[0]?.color || null);
  const [selectedSize, setSelectedSize] = useState(sizes?.[0]?.size || null);

  // Get the first valid image URL or use a fallback
  const productImage = images?.[0] || '/images/product-placeholder.png';

  const handleAddToCart = async () => {
    // First, check authentication status
    if (!isAuthenticated()) {
      const result = await Swal.fire({
        title: "Login Required",
        text: "You need to login before adding items to your cart",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      if (result.isConfirmed) {
        navigate("/login?redirect=/products");
      }
      return;
    }

    // Validate size if product has sizes
    if (sizes?.length > 0 && !selectedSize) {
      await Swal.fire({
        title: "Please Select a Size",
        text: "You need to select a size before adding to cart",
        icon: "warning",
      });
      return;
    }

    // Validate color if product has colors
    if (colors?.length > 0 && !selectedColor) {
      await Swal.fire({
        title: "Please Select a Color",
        text: "You need to select a color before adding to cart",
        icon: "warning",
      });
      return;
    }

    try {
      // Thêm sản phẩm vào giỏ hàng
      addToCart(
        {
          _id,
          name,
          price,
          images,
          stock,
        },
        1,
        selectedSize,
        selectedColor
      );

      // Cập nhật UI giỏ hàng
      updateCartItems();

      // Hiển thị thông báo thành công
      await Swal.fire({
        title: "Added to Cart!",
        text: "Product has been added to your cart",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      await Swal.fire({
        title: "Error",
        text: "Failed to add product to cart. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm group relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="relative">
        <img
          src={productImage}
          alt={name || "Product image"}
          className="w-full h-[400px] object-cover transform transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            console.error("Image failed to load:", productImage);
            e.target.src = "https://via.placeholder.com/300?text=Image+Error";
          }}
        />
        {stock <= 5 && stock > 0 && (
          <span className="absolute top-4 right-4 bg-luxury-gold text-white px-3 py-1 text-sm font-serif">
            Only {stock} left
          </span>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-lg font-serif tracking-wider">
              Sold Out
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-serif text-luxury-dark">{name}</h3>
            <p className="text-sm text-luxury-gold font-medium mt-1">{brand}</p>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center">
              <span className="text-luxury-gold">★</span>
              <span className="text-sm text-luxury-dark/70 ml-1 font-serif">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <p className="text-luxury-dark/70 text-sm mb-6 line-clamp-2">
          {description}
        </p>

        {Array.isArray(colors) && colors.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-serif text-luxury-dark mb-3">
              Color Options
            </p>
            <div className="flex gap-3">
              {colors.map((c, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(c.color)}
                  className={`w-7 h-7 rounded-full border transition-transform hover:scale-110 ${
                    selectedColor === c.color
                      ? "border-luxury-gold ring-1 ring-luxury-gold"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.hexCode }}
                  title={c.color}
                />
              ))}
            </div>
          </div>
        )}

        {Array.isArray(sizes) && sizes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-serif text-luxury-dark mb-3">
              Select Size
            </p>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSize(s.size)}
                  className={`w-12 h-12 text-sm font-serif rounded-full border transition-all duration-200 ${
                    selectedSize === s.size
                      ? "bg-luxury-gold text-white border-luxury-gold"
                      : "border-gray-200 text-luxury-dark hover:border-luxury-gold"
                  } ${
                    s.stock === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "transform hover:scale-105"
                  }`}
                  disabled={s.stock === 0}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <p className="text-luxury-gold font-serif text-xl">
            {formatCurrency(price || 0)}
          </p>
          <button
            onClick={handleAddToCart}
            className={`px-6 py-3 transition-all duration-200 font-serif text-sm tracking-wider ${
              stock > 0
                ? "bg-luxury-gold text-white hover:bg-luxury-dark active:transform active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            disabled={stock === 0}
          >
            {stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
