import { useState, useEffect } from "react";
import CategoryDropdown from "./CategoryDropdown";

export default function ProductFilter({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  loading = false, // Add loading prop
}) {
  // console.log("ProductFilter received categories:", categories.length);
  // console.log("ProductFilter received brands:", brands.length);
  // Local state for filters
  const [tempFilters, setTempFilters] = useState({
    category: selectedCategory,
    brand: selectedBrand,
    priceRange: selectedPriceRange,
  });

  // Update local state when props change
  useEffect(() => {
    setTempFilters({
      category: selectedCategory,
      brand: selectedBrand,
      priceRange: selectedPriceRange,
    });
  }, [selectedCategory, selectedBrand, selectedPriceRange]);
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
    console.log("Filter change in ProductFilter:", changes);
    const newFilters = { ...tempFilters, ...changes };
    console.log("New filters (before update):", newFilters);
    setTempFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div
      className={`space-y-8 ${loading ? "opacity-60 pointer-events-none" : ""}`}
    >
      {" "}
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-serif text-luxury-dark mb-4">Category</h3>
        <CategoryDropdown
          categories={categories}
          selectedCategory={tempFilters.category}
          onCategoryChange={(categoryId) => {
            console.log("Selected category ID:", categoryId);
            const selectedCategory = categories.find(
              (cat) => cat._id.toString() === categoryId
            );
            console.log("Selected category:", selectedCategory);

            handleFilterChange({ category: categoryId });
          }}
          disabled={loading}
        />
      </div>
      {/* Brand Filter */}{" "}
      <div>
        <h3 className="text-lg font-serif text-luxury-dark mb-4">Brand</h3>
        <select
          value={tempFilters.brand}
          onChange={(e) => {
            const brandId = e.target.value;
            console.log("Selected brand ID:", brandId);

            if (brandId) {
              // If a brand is selected, validate it exists in our brands data
              const selectedBrand = brands.find((b) => {
                const bId = b._id ? b._id.toString() : "";
                const match = bId === brandId;
                if (match) {
                  console.log(
                    `Brand match found: ${b.name} (${bId}) === ${brandId}`
                  );
                }
                return match;
              });

              console.log("Selected brand object:", selectedBrand);

              if (!selectedBrand) {
                console.warn(
                  `Brand with ID ${brandId} not found in brands list!`
                );
              }
            }

            // Show summary of all brands for debugging
            console.log(
              `All brands (${brands.length}):`,
              brands.map((b) => ({
                id: b._id ? b._id.toString() : "no-id",
                name: b.name || "unnamed",
              }))
            );

            handleFilterChange({ brand: brandId });
          }}
          className="w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
          disabled={loading}
        >
          {" "}
          <option value="">All Brands</option>
          {brands.map((brand) => {
            // Make sure we have a valid brand ID
            const brandId = brand._id ? brand._id.toString() : "";
            if (!brandId) {
              console.warn("Brand without ID:", brand);
              return null; // Skip this brand
            }

            return (
              <option key={brandId} value={brandId}>
                {brand.name || "Unknown Brand"}
              </option>
            );
          })}
        </select>
      </div>
      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-serif text-luxury-dark mb-4">
          Price Range
        </h3>{" "}
        <select
          value={
            tempFilters.priceRange.min === null
              ? "all"
              : `${tempFilters.priceRange.min}-${
                  tempFilters.priceRange.max === Infinity
                    ? "up"
                    : tempFilters.priceRange.max
                }`
          }
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log("Selected price range value:", selectedValue);
            const selected = priceRanges.find(
              (range) => range.id === selectedValue
            );
            console.log("Selected price range object:", selected);

            if (selected) {
              const newPriceRange =
                selected.value === "all"
                  ? { min: null, max: null }
                  : { min: selected.min, max: selected.max };

              console.log("Setting price range to:", newPriceRange);
              handleFilterChange({
                priceRange: newPriceRange,
              });
            }
          }}
          className="w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
          disabled={loading}
        >
          {priceRanges.map((range) => (
            <option key={range.id} value={range.id}>
              {range.label}
            </option>
          ))}
        </select>
      </div>{" "}
      {/* Filter Actions */}
      <div className="flex justify-between gap-6 mt-12">
        <button
          onClick={onResetFilters}
          className="flex-1 px-6 py-3 border border-luxury-gold/30 text-luxury-dark/70 hover:border-luxury-gold hover:text-luxury-dark transition-colors font-serif text-sm tracking-wider"
          disabled={loading}
        >
          {loading ? "Loading..." : "Reset"}
        </button>{" "}
        <button
          onClick={() => {
            console.log(
              "Apply button clicked, current tempFilters:",
              tempFilters
            );
            // Only apply filters when button is clicked
            onApplyFilters();
          }}
          className="flex-1 px-6 py-3 bg-luxury-gold text-white hover:bg-luxury-dark transition-colors font-serif text-sm tracking-wider disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>
      {/* Loading indicator */}
      {loading && (
        <div className="text-center text-luxury-gold/70 text-sm font-serif">
          Updating filters...
        </div>
      )}
    </div>
  );
}
