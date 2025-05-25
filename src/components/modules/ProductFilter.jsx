import { useState, useEffect } from "react";

export default function ProductFilter({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
}) {
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
    { id: "all", label: "All Prices", value: "all" },
    { id: "0-100", label: "Under $100", min: 0, max: 100 },
    { id: "100-200", label: "$100 - $200", min: 100, max: 200 },
    { id: "200-300", label: "$200 - $300", min: 200, max: 300 },
    { id: "300-up", label: "Over $300", min: 300, max: Infinity },
  ];

  const handleFilterChange = (changes) => {
    const newFilters = { ...tempFilters, ...changes };
    setTempFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-serif text-luxury-dark mb-4">Category</h3>
        <select
          value={tempFilters.category}
          onChange={(e) => handleFilterChange({ category: e.target.value })}
          className="w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-lg font-serif text-luxury-dark mb-4">Brand</h3>
        <select
          value={tempFilters.brand}
          onChange={(e) => handleFilterChange({ brand: e.target.value })}
          className="w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-serif text-luxury-dark mb-4">Price Range</h3>
        <select
          value={
            tempFilters.priceRange.min === null
              ? "all"
              : `${tempFilters.priceRange.min}-${tempFilters.priceRange.max}`
          }
          onChange={(e) => {
            const selected = priceRanges.find(
              (range) => range.id === e.target.value
            );
            handleFilterChange({
              priceRange:
                selected?.value === "all"
                  ? { min: null, max: null }
                  : { min: selected?.min, max: selected?.max },
            });
          }}
          className="w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
        >
          {priceRanges.map((range) => (
            <option key={range.id} value={range.id}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-between gap-6 mt-12">
        <button
          onClick={onResetFilters}
          className="flex-1 px-6 py-3 border border-luxury-gold/30 text-luxury-dark/70 hover:border-luxury-gold hover:text-luxury-dark transition-colors font-serif text-sm tracking-wider"
        >
          Reset
        </button>
        <button
          onClick={() => onApplyFilters(tempFilters)}
          className="flex-1 px-6 py-3 bg-luxury-gold text-white hover:bg-luxury-dark transition-colors font-serif text-sm tracking-wider"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
