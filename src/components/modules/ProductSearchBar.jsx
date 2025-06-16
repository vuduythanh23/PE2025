import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsBySearch } from "../../utils/api/products";

export default function ProductSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const performSearch = async (query) => {
    try {
      setIsLoading(true);
      setIsSearching(true);

      // Use the search API endpoint
      const results = await getProductsBySearch(query);

      // Validate and sanitize results
      let validResults = [];
      if (Array.isArray(results)) {
        validResults = results
          .filter((product) => product && typeof product === "object")
          .map((product) => ({
            _id: product._id || product.id || Math.random().toString(36),
            name: String(product.name || "Unnamed Product"),
            brand: String(product.brand || "Unknown Brand"),
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            images: Array.isArray(product.images) ? product.images : [],
          }))
          .slice(0, 6); // Limit to 6 results
      }

      setSearchResults(validResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === "") {
      setShowResults(false);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Search for shoes, brands, categories..."
            className="w-full px-6 py-4 text-lg border-2 border-luxury-gold/20 rounded-full focus:border-luxury-gold focus:outline-none bg-white/90 backdrop-blur-sm shadow-lg placeholder-gray-500 transition-all duration-300"
          />

          {/* Search Icon */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-luxury-gold text-white p-3 rounded-full hover:bg-luxury-dark transition-colors duration-300 disabled:opacity-50"
            disabled={!searchQuery.trim() || isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-sm text-gray-500 px-3 py-2 border-b">
              Found {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </div>
            {searchResults.map((product, index) => (
              <div
                key={product._id || product.id || index}
                onClick={() => handleProductClick(product._id || product.id)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors duration-200"
              >
                <img
                  src={product.images?.[0] || "/images/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />{" "}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {product.name || "Unnamed Product"}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {product.brand || "Unknown Brand"} • ${product.price || 0}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-luxury-gold font-semibold">
                    ${product.price || 0}
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="text-xs text-orange-600">
                      {product.stock} left
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="text-xs text-red-600">Out of stock</div>
                  )}
                </div>
              </div>
            ))}

            <div className="border-t pt-2 mt-2">
              <button
                onClick={handleSearchSubmit}
                className="w-full text-left px-3 py-2 text-luxury-gold hover:bg-luxury-gold/10 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                View all results for "{searchQuery}" →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults &&
        searchResults.length === 0 &&
        !isLoading &&
        searchQuery.trim().length >= 2 && (
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 z-50"
          >
            <div className="p-4 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p>No products found for "{searchQuery}"</p>
              <p className="text-sm mt-1">
                Try different keywords or browse our categories
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
