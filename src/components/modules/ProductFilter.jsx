import { useState, useEffect } from "react";

export default function ProductFilter({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  selectedParentCategory,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  loading = false,
}) {
  const [tempFilters, setTempFilters] = useState({
    category: selectedCategory,
    brand: selectedBrand,
    priceRange: selectedPriceRange,
  });

  const [expandedSection, setExpandedSection] = useState("category");

  useEffect(() => {
    setTempFilters({
      category: selectedCategory,
      brand: selectedBrand,
      priceRange: selectedPriceRange,
    });
  }, [selectedCategory, selectedBrand, selectedPriceRange]);

  // Group categories by parent type
  const getCategorizedCategories = () => {
    if (!categories.length) return { men: [], women: [], kids: [], other: [] };

    const categorized = {
      men: [],
      women: [],
      kids: [],
      other: []
    };

    categories.forEach(category => {
      const categoryName = category.name?.toLowerCase() || "";
      
      if (categoryName.includes("men") || categoryName.includes("male")) {
        categorized.men.push(category);
      } else if (categoryName.includes("women") || categoryName.includes("female") || categoryName.includes("woman")) {
        categorized.women.push(category);
      } else if (categoryName.includes("kids") || categoryName.includes("children") || categoryName.includes("child")) {
        categorized.kids.push(category);
      } else {
        categorized.other.push(category);
      }
    });

    return categorized;
  };

  const categorizedCategories = getCategorizedCategories();

  const priceRanges = [
    { id: "all", label: "All Prices", value: "all", min: null, max: null },
    { id: "0-100", label: "Under $100", value: "range", min: 0, max: 100 },
    { id: "100-200", label: "$100 - $200", value: "range", min: 100, max: 200 },
    { id: "200-300", label: "$200 - $300", value: "range", min: 200, max: 300 },
    { id: "300-up", label: "Over $300", value: "range", min: 300, max: Infinity },
  ];

  const handleFilterChange = (changes) => {
    const newFilters = { ...tempFilters, ...changes };
    setTempFilters(newFilters);
    onFilterChange(newFilters);
  };  const handleCategorySelect = (categoryId) => {
    handleFilterChange({ category: categoryId });
    // Auto-close category section and open brand section for better UX flow
    setTimeout(() => {
      setExpandedSection("brand");
    }, 300); // Small delay to show selection feedback
  };

  const handleBrandSelect = (brandId) => {
    handleFilterChange({ brand: brandId });
    // Auto-close brand section and open price section for better UX flow
    setTimeout(() => {
      setExpandedSection("price");
    }, 300);
  };

  const handlePriceRangeSelect = (priceRange) => {
    handleFilterChange({ priceRange });
    // Auto-close price section after selection
    setTimeout(() => {
      setExpandedSection("");
    }, 300);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  return (
    <div className={`space-y-6 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Selected Parent Category Info */}
      {selectedParentCategory && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg p-4">
          <h4 className="text-sm font-serif text-luxury-dark/80 mb-2">Filtering by:</h4>
          <span className="inline-block bg-luxury-gold text-white px-3 py-1 rounded-full text-sm font-serif capitalize">
            {selectedParentCategory}
          </span>
        </div>
      )}

      {/* Category Filter */}
      <div className="border border-luxury-gold/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("category")}
          className="w-full p-4 bg-luxury-gold/5 hover:bg-luxury-gold/10 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-serif text-luxury-dark">Category</span>
          </div>
          <svg
            className={`w-5 h-5 text-luxury-gold transition-transform ${
              expandedSection === "category" ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {expandedSection === "category" && (
          <div className="p-4 bg-white border-t border-luxury-gold/20">
            {/* All Categories option */}
            <div
              onClick={() => handleCategorySelect("")}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                !tempFilters.category
                  ? "bg-luxury-gold text-white"
                  : "border border-luxury-gold/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/5"
              }`}
            >
              <span className="font-serif">All Categories</span>
            </div>

            {/* Men's Categories */}
            {categorizedCategories.men.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-serif text-luxury-gold mb-2 font-semibold">Men's Shoes</h4>
                <div className="space-y-1 pl-4">
                  {categorizedCategories.men.map((category) => (
                    <div
                      key={category._id}
                      onClick={() => handleCategorySelect(category._id)}
                      className={`p-2 rounded cursor-pointer font-serif text-sm transition-all ${
                        category._id === tempFilters.category
                          ? "bg-luxury-gold text-white"
                          : "hover:bg-luxury-gold/10 text-luxury-dark"
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Women's Categories */}
            {categorizedCategories.women.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-serif text-luxury-gold mb-2 font-semibold">Women's Shoes</h4>
                <div className="space-y-1 pl-4">
                  {categorizedCategories.women.map((category) => (
                    <div
                      key={category._id}
                      onClick={() => handleCategorySelect(category._id)}
                      className={`p-2 rounded cursor-pointer font-serif text-sm transition-all ${
                        category._id === tempFilters.category
                          ? "bg-luxury-gold text-white"
                          : "hover:bg-luxury-gold/10 text-luxury-dark"
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kids' Categories */}
            {categorizedCategories.kids.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-serif text-luxury-gold mb-2 font-semibold">Kids' Shoes</h4>
                <div className="space-y-1 pl-4">
                  {categorizedCategories.kids.map((category) => (
                    <div
                      key={category._id}
                      onClick={() => handleCategorySelect(category._id)}
                      className={`p-2 rounded cursor-pointer font-serif text-sm transition-all ${
                        category._id === tempFilters.category
                          ? "bg-luxury-gold text-white"
                          : "hover:bg-luxury-gold/10 text-luxury-dark"
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Categories */}
            {categorizedCategories.other.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-serif text-luxury-gold mb-2 font-semibold">Other Categories</h4>
                <div className="space-y-1 pl-4">
                  {categorizedCategories.other.map((category) => (
                    <div
                      key={category._id}
                      onClick={() => handleCategorySelect(category._id)}
                      className={`p-2 rounded cursor-pointer font-serif text-sm transition-all ${
                        category._id === tempFilters.category
                          ? "bg-luxury-gold text-white"
                          : "hover:bg-luxury-gold/10 text-luxury-dark"
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="border border-luxury-gold/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("brand")}
          className="w-full p-4 bg-luxury-gold/5 hover:bg-luxury-gold/10 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11c0 .55.45 1 1 1h3v-6h6v6h3c.55 0 1-.45 1-1V7l-7-5z" clipRule="evenodd" />
            </svg>
            <span className="font-serif text-luxury-dark">Brand</span>
            <span className="ml-2 text-xs text-luxury-gold">({brands.length} available)</span>
          </div>
          <svg
            className={`w-5 h-5 text-luxury-gold transition-transform ${
              expandedSection === "brand" ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {expandedSection === "brand" && (
          <div className="p-4 bg-white border-t border-luxury-gold/20">            <select
              value={tempFilters.brand}
              onChange={(e) => handleBrandSelect(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-luxury-gold/30 bg-white text-luxury-dark focus:outline-none focus:border-luxury-gold transition-all font-serif"
              disabled={loading}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand._id || brand.id} value={brand._id || brand.id} className="font-serif">
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border border-luxury-gold/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("price")}
          className="w-full p-4 bg-luxury-gold/5 hover:bg-luxury-gold/10 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-serif text-luxury-dark">Price Range</span>
          </div>
          <svg
            className={`w-5 h-5 text-luxury-gold transition-transform ${
              expandedSection === "price" ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {expandedSection === "price" && (
          <div className="p-4 bg-white border-t border-luxury-gold/20">
            <div className="space-y-3">
              {priceRanges.map((range) => {
                const isSelected =
                  (range.value === "all" && (!tempFilters.priceRange.min && !tempFilters.priceRange.max)) ||
                  (range.value === "range" &&
                    tempFilters.priceRange.min === range.min &&
                    tempFilters.priceRange.max === range.max);

                return (
                  <label
                    key={range.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-luxury-gold text-white"
                        : "border border-luxury-gold/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.id}
                      checked={isSelected}                      onChange={() => {
                        handlePriceRangeSelect({ min: range.min, max: range.max });
                      }}
                      className="mr-3 text-luxury-gold focus:ring-luxury-gold"
                      disabled={loading}
                    />
                    <span className="font-serif">{range.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Apply and Reset Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onApplyFilters}
          className="w-full bg-luxury-gold text-white py-3 px-4 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Filters"}
        </button>
        <button
          onClick={onResetFilters}
          className="w-full border-2 border-luxury-gold/30 text-luxury-dark py-3 px-4 rounded-lg font-serif text-sm tracking-wider transition-all hover:border-luxury-gold hover:bg-luxury-gold/5 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Reset All
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center text-luxury-gold/70 text-sm font-serif mt-4">
          Updating filters...
        </div>
      )}
    </div>
  );
}
