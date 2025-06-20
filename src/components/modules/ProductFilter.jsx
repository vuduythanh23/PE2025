import { useState, useEffect } from "react";

export default function ProductFilter({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  selectedParentCategory,
  appliedCategory,
  appliedBrand,
  appliedPriceRange,
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

  const [expandedSection, setExpandedSection] = useState(null); // Không mở section nào mặc định

  useEffect(() => {
    setTempFilters({
      category: selectedCategory,
      brand: selectedBrand,
      priceRange: selectedPriceRange,
    });
  }, [selectedCategory, selectedBrand, selectedPriceRange]); // Group categories by parent-child relationship using database schema
  const getCategorizedCategories = () => {
    if (!categories.length) return { mainCategories: [], subCategories: {} };

    const mainCategories = categories.filter(
      (cat) => cat.type === "main" && !cat.parent
    );
    const subCategories = {};

    // Group subcategories by their parent
    mainCategories.forEach((mainCat) => {
      subCategories[mainCat._id] = categories.filter(
        (cat) =>
          cat.type === "sub" &&
          cat.parent &&
          (typeof cat.parent === "string"
            ? cat.parent === mainCat._id
            : cat.parent._id === mainCat._id)
      );
    });

    // Also collect orphaned subcategories (subcategories without valid parent)
    const orphanedSubs = categories.filter(
      (cat) =>
        cat.type === "sub" &&
        (!cat.parent ||
          !mainCategories.find(
            (main) =>
              main._id ===
              (typeof cat.parent === "string" ? cat.parent : cat.parent._id)
          ))
    );

    return { mainCategories, subCategories, orphanedSubs };
  };
  const categorizedCategories = getCategorizedCategories();

  const priceRanges = [
    { id: "all", label: "All Prices", value: "all", min: null, max: null },
    { id: "0-100", label: "Under $100", value: "range", min: 0, max: 100 },
    { id: "100-200", label: "$100 - $200", value: "range", min: 100, max: 200 },
    { id: "200-300", label: "$200 - $300", value: "range", min: 200, max: 300 },
    {
      id: "300-up",
      label: "Over $300",
      value: "range",
      min: 300,
      max: Infinity,
    },
  ];

  const handleFilterChange = (changes) => {
    const newFilters = { ...tempFilters, ...changes };
    setTempFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategorySelect = (categoryId) => {
    handleFilterChange({ category: categoryId });
    // Auto-close category section and open brand section for better UX flow
    setTimeout(() => {
      setExpandedSection("brand");
    }, 300); // Small delay to show selection feedback
  };

  const handleBrandSelect = (brandId) => {
    handleFilterChange({ brand: brandId });
    setTimeout(() => {
      setExpandedSection("price");
    }, 300);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId) return null;
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : null;
  };

  // Helper function to get brand name by ID
  const getBrandNameById = (brandId) => {
    if (!brandId) return null;
    const brand = brands.find((b) => (b._id || b.id) === brandId);
    return brand ? brand.name : null;
  };

  // Helper function to get price range display text
  const getPriceRangeText = (priceRange) => {
    if (!priceRange || priceRange.id === "all") return null;
    return priceRange.label;
  };
  // Check if any filters are applied (use applied filters, not temporary ones)
  const hasAppliedFilters =
    selectedParentCategory ||
    appliedCategory ||
    appliedBrand ||
    (appliedPriceRange &&
      appliedPriceRange.min !== null &&
      appliedPriceRange.max !== null);

  return (
    <div
      className={`space-y-6 ${loading ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Applied Filters Display */}
      {hasAppliedFilters && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg p-4">
          <h4 className="text-sm font-serif text-luxury-dark/80 mb-2">
            Filtering by:
          </h4>
          <div className="flex flex-wrap gap-2">
            {/* Parent Category (from quick filter) */}
            {selectedParentCategory && (
              <span className="inline-block bg-luxury-gold text-white px-3 py-1 rounded-full text-sm font-serif capitalize">
                {selectedParentCategory}
              </span>
            )}

            {/* Specific Category */}
            {appliedCategory && (
              <span className="inline-block bg-luxury-dark text-white px-3 py-1 rounded-full text-sm font-serif">
                {getCategoryNameById(appliedCategory) || "Category"}
              </span>
            )}

            {/* Brand */}
            {appliedBrand && (
              <span className="inline-block bg-luxury-forest text-white px-3 py-1 rounded-full text-sm font-serif">
                {getBrandNameById(appliedBrand) || "Brand"}
              </span>
            )}

            {/* Price Range */}
            {appliedPriceRange &&
              (appliedPriceRange.min !== null ||
                appliedPriceRange.max !== null) && (
                <span className="inline-block bg-luxury-light text-white px-3 py-1 rounded-full text-sm font-serif">
                  {appliedPriceRange.min !== null &&
                  appliedPriceRange.max !== null &&
                  appliedPriceRange.max !== Infinity
                    ? `$${appliedPriceRange.min} - $${appliedPriceRange.max}`
                    : appliedPriceRange.min !== null
                    ? `Over $${appliedPriceRange.min}`
                    : appliedPriceRange.max !== null &&
                      appliedPriceRange.max !== Infinity
                    ? `Under $${appliedPriceRange.max}`
                    : "Price Range"}
                </span>
              )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="border border-luxury-gold/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("category")}
          className="w-full p-4 bg-luxury-gold/5 hover:bg-luxury-gold/10 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-3 text-luxury-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
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
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>{" "}
        {expandedSection === "category" && (
          <div className="p-4 bg-white border-t border-luxury-gold/20">
            {/* All Categories option */}
            <div
              onClick={() => handleCategorySelect("")}
              className={`p-3 mb-3 rounded-lg cursor-pointer transition-all ${
                !tempFilters.category
                  ? "bg-luxury-gold text-white"
                  : "border border-luxury-gold/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/5"
              }`}
            >
              <span className="font-serif">All Categories</span>
            </div>

            {/* Render Main Categories with their Subcategories */}
            {categorizedCategories.mainCategories &&
            categorizedCategories.mainCategories.length > 0 ? (
              <div className="space-y-4">
                {categorizedCategories.mainCategories.map((mainCategory) => (
                  <div key={mainCategory._id} className="mb-4">
                    {/* Main Category - Display only, not clickable for filtering */}
                    <div className="p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/20 mb-2">
                      <span className="font-serif font-semibold text-luxury-dark">
                        {mainCategory.name}
                      </span>
                      <span className="text-xs text-luxury-dark/60 ml-2">
                        (
                        {categorizedCategories.subCategories[mainCategory._id]
                          ?.length || 0}{" "}
                        subcategories)
                      </span>
                    </div>

                    {/* Subcategories - These are clickable for filtering */}
                    {categorizedCategories.subCategories[mainCategory._id] &&
                      categorizedCategories.subCategories[mainCategory._id]
                        .length > 0 && (
                        <div className="space-y-1 pl-4">
                          {categorizedCategories.subCategories[
                            mainCategory._id
                          ].map((subCategory) => (
                            <div
                              key={subCategory._id}
                              onClick={() =>
                                handleCategorySelect(subCategory._id)
                              }
                              className={`p-2 rounded cursor-pointer font-serif text-sm transition-all ${
                                subCategory._id === tempFilters.category
                                  ? "bg-luxury-gold text-white"
                                  : "hover:bg-luxury-gold/10 text-luxury-dark border border-transparent hover:border-luxury-gold/20"
                              }`}
                            >
                              {subCategory.name}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {/* Orphaned Subcategories (subcategories without valid parent) */}
                {categorizedCategories.orphanedSubs &&
                  categorizedCategories.orphanedSubs.length > 0 && (
                    <div className="mb-4">
                      <div className="p-3 rounded-lg bg-gray-100 border border-gray-200 mb-2">
                        <span className="font-serif font-semibold text-gray-700">
                          Other Categories
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({categorizedCategories.orphanedSubs.length} items)
                        </span>
                      </div>

                      <div className="space-y-1 pl-4">
                        {categorizedCategories.orphanedSubs.map((category) => (
                          <div
                            key={category._id}
                            onClick={() => handleCategorySelect(category._id)}
                            className={`p-2 rounded cursor-pointer font-serif text-sm transition-all ${
                              category._id === tempFilters.category
                                ? "bg-luxury-gold text-white"
                                : "hover:bg-luxury-gold/10 text-luxury-dark border border-transparent hover:border-luxury-gold/20"
                            }`}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center text-luxury-dark/60 py-4">
                <span className="font-serif">No categories available</span>
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
            <svg
              className="w-5 h-5 mr-3 text-luxury-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2L3 7v11c0 .55.45 1 1 1h3v-6h6v6h3c.55 0 1-.45 1-1V7l-7-5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-serif text-luxury-dark">Brand</span>
            <span className="ml-2 text-xs text-luxury-gold">
              ({brands.length} available)
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-luxury-gold transition-transform ${
              expandedSection === "brand" ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expandedSection === "brand" && (
          <div className="p-4 bg-white border-t border-luxury-gold/20">
            <select
              value={tempFilters.brand}
              onChange={(e) => handleBrandSelect(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-luxury-gold/30 bg-white text-luxury-dark focus:outline-none focus:border-luxury-gold transition-all font-serif"
              disabled={loading}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option
                  key={brand._id || brand.id}
                  value={brand._id || brand.id}
                  className="font-serif"
                >
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
            <svg
              className="w-5 h-5 mr-3 text-luxury-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
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
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expandedSection === "price" && (
          <div className="p-4 bg-white border-t border-luxury-gold/20">
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <div
                  key={range.id}
                  onClick={() => handleFilterChange({ priceRange: range })}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    tempFilters.priceRange?.id === range.id
                      ? "bg-luxury-gold text-white"
                      : "border border-luxury-gold/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/5"
                  }`}
                >
                  <span className="font-serif">{range.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Actions */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onApplyFilters}
          className="w-full bg-luxury-gold text-white py-3 px-4 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg hover:bg-luxury-dark"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Filters"}
        </button>

        <button
          onClick={onResetFilters}
          className="w-full border border-luxury-gold text-luxury-gold py-3 px-4 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg hover:bg-luxury-gold hover:text-white"
          disabled={loading}
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
