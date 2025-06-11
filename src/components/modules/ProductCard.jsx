import { formatCurrency, isAuthenticated, addItemToCart } from "../../utils";
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
  const navigate = useNavigate(); // Get the first valid image URL or use a fallback
  const productImage =
    images && images.length > 0
      ? images[0]
      : props.imageUrl || "/images/placeholder-product.jpg";

  // Handle view more information - navigate to product detail page
  const handleViewMore = (e) => {
    e.stopPropagation();
    navigate(`/product/${_id}`);
  };
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
    }    try {
      // Add product to cart using backend API
      await addItemToCart({
        productId: _id,
        quantity: 1,
        selectedSize: sizes?.[0]?.size || null, // Use first available size or null
        selectedColor: colors?.[0]?.color || null // Use first available color or null
      });

      // Update cart UI
      updateCartItems();

      // Show success message
      await Swal.fire({
        title: "Added to Cart!",
        text: "Product has been added to your cart",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to add product to cart. Please try again.",
        icon: "error",
      });
    }
  };
  const handleBuyNow = async () => {
    // First, check authentication status
    if (!isAuthenticated()) {
      const result = await Swal.fire({
        title: "Login Required",
        text: "You need to login before making a purchase",
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

    try {
      // Add product to cart using backend API
      await addItemToCart({
        productId: _id,
        quantity: 1,
        selectedSize: sizes?.[0]?.size || null,
        selectedColor: colors?.[0]?.color || null
      });

      // Update cart UI
      updateCartItems();

      // Show brief success message and redirect to cart
      await Swal.fire({
        title: "Added to Cart!",
        text: "Redirecting to checkout...",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });

      // Navigate to cart or checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error with buy now:", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to process purchase. Please try again.",
        icon: "error",
      });
    }
  };
  return (
    <div className="bg-white/80 backdrop-blur-sm group relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[600px] flex flex-col">
      {/* Image Container with Fixed Height */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={productImage}
          alt={name || "Product image"}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            console.error("Image failed to load:", productImage);
            e.target.src = "/images/placeholder-product.jpg";
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

      {/* Content Container */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-serif text-luxury-dark truncate">
              {name}
            </h3>
            <p className="text-sm text-luxury-gold font-medium mt-1 truncate">
              {brand}
            </p>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center ml-2">
              <span className="text-luxury-gold">★</span>
              <span className="text-sm text-luxury-dark/70 ml-1 font-serif">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Description Section */}
        <p className="text-luxury-dark/70 text-sm mb-4 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Price and Actions Section */}
        <div className="mt-auto space-y-4">
          <div className="text-center">
            <p className="text-luxury-gold font-serif text-2xl">
              {formatCurrency(price || 0)}
            </p>
          </div>          <div className="flex gap-2">
            <button
              onClick={handleBuyNow}
              className={`flex-1 py-3 px-3 transition-all duration-200 font-serif text-xs tracking-wider ${
                stock > 0
                  ? "bg-luxury-gold text-white hover:bg-luxury-dark active:transform active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={stock === 0}
            >
              {stock > 0 ? "Buy Now" : "Out of Stock"}
            </button>

            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-3 transition-all duration-200 font-serif text-xs tracking-wider ${
                stock > 0
                  ? "border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
              }`}
              disabled={stock === 0}
            >
              {stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>

            <button
              onClick={handleViewMore}
              className="flex-1 py-3 px-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-200 font-serif text-xs tracking-wider"
            >
              View More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
