import { formatCurrency, isAuthenticated } from "../../utils";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import AddToCartModal from "./AddToCartModal";
import { saveProductsState } from "../../utils/helpers/productsState";

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
  
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  // Get the first valid image URL or use a fallback
  const productImage =
    images && images.length > 0
      ? images[0]
      : props.imageUrl || "/images/placeholder-product.jpg";
  // Handle view more information - navigate to product detail page
  const handleViewMore = (e) => {
    e.stopPropagation();
    
    // Save current products page state before navigating
    if (location.pathname === '/products') {
      const currentState = {
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        priceRange: {
          min: searchParams.get('minPrice') || '',
          max: searchParams.get('maxPrice') || ''
        },
        searchQuery: searchParams.get('search') || '',
        currentPage: parseInt(searchParams.get('page')) || 1,
        sortBy: searchParams.get('sort') || '',
      };
      saveProductsState(currentState);
    }
    
    navigate(`/product/${_id}`);
  };const handleAddToCart = async () => {
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
        customClass: {
          container: "z-[9999]",
          popup: "z-[9999]",
        },
      });
      if (result.isConfirmed) {
        navigate("/login?redirect=/products");
      }
      return;
    }

    // Open the add to cart modal
    setShowAddToCartModal(true);
  };

  return (
    <div className="group relative overflow-hidden transition-all duration-500 ease-out transform hover:-translate-y-2 hover:rotate-1 h-[600px] flex flex-col perspective-1000">
      {/* 3D Card Container */}
      <div className="relative w-full h-full bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out transform-gpu hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.02] preserve-3d">
        {/* Image Container with Fixed Aspect Ratio */}
        <div className="relative h-[320px] overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Image with consistent sizing and 3D effect */}
          <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-y-12">
            <img
              src={productImage}
              alt={name || "Product image"}
              className="absolute inset-0 w-full h-full object-contain object-center p-6 transition-all duration-700 group-hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                transform: "translateZ(20px)",
              }}
              onError={(e) => {
                console.error("Image failed to load:", productImage);
                e.target.src = "/images/placeholder-product.jpg";
              }}
            />
          </div>
          {/* Stock badges with 3D effect */}
          {stock <= 5 && stock > 0 && (
            <span className="absolute top-4 right-4 bg-luxury-gold text-white px-3 py-1 text-sm font-serif transform transition-all duration-300 hover:scale-110 shadow-lg z-10">
              Only {stock} left
            </span>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-t-lg z-10">
              <span className="text-white text-lg font-serif tracking-wider transform transition-all duration-300 scale-110">
                Sold Out
              </span>
            </div>
          )}
          {/* Gradient overlay with 3D depth */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent h-24 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0" />
          {/* Reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-lg pointer-events-none"></div>
        </div>

        {/* Content Container with 3D effect */}
        <div className="p-6 flex-1 flex flex-col relative transform transition-all duration-300 group-hover:translate-z-4">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-serif text-luxury-dark truncate transition-colors duration-300 group-hover:text-luxury-gold">
                {name}
              </h3>
              <p className="text-sm text-luxury-gold font-medium mt-1 truncate transition-all duration-300 group-hover:font-semibold">
                {brand}
              </p>
            </div>
            {averageRating > 0 && (
              <div className="flex items-center ml-2 transform transition-all duration-300 group-hover:scale-110">
                <span className="text-luxury-gold">★</span>
                <span className="text-sm text-luxury-dark/70 ml-1 font-serif">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <p className="text-luxury-dark/70 text-sm mb-4 line-clamp-2 flex-1 transition-colors duration-300 group-hover:text-luxury-dark">
            {description}
          </p>

          {/* Price and Actions Section with 3D effects */}
          <div className="mt-auto space-y-4">
            <div className="text-center transform transition-all duration-300 group-hover:scale-105">
              <p className="text-luxury-gold font-serif text-2xl font-bold group-hover:text-3xl transition-all duration-300">
                {formatCurrency(price || 0)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-3 transition-all duration-300 font-serif text-xs tracking-wider transform hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-lg ${
                  stock > 0
                    ? "bg-luxury-gold text-white hover:bg-luxury-dark hover:shadow-luxury-gold/30"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={stock === 0}
              >
                {stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                onClick={handleViewMore}
                className="flex-1 py-3 px-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300 font-serif text-xs tracking-wider transform hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-lg hover:shadow-luxury-gold/30"
              >
                View More
              </button>
            </div>
          </div>
        </div>
      </div>      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        product={props}
        onSuccess={() => {
          // Optional: Add any additional success handling
        }}
      />
    </div>
  );
}
