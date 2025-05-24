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
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category</h3>
        <select
          value={tempFilters.category}
          onChange={(e) => handleFilterChange({ category: e.target.value })}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Brand</h3>
        <select
          value={tempFilters.brand}
          onChange={(e) => handleFilterChange({ brand: e.target.value })}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Price Range
        </h3>
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
            if (!selected) {
              handleFilterChange({
                priceRange: { min: null, max: null },
              });
              return;
            }
            if (selected.value === "all") {
              handleFilterChange({
                priceRange: { min: null, max: null },
              });
            } else {
              handleFilterChange({
                priceRange: { min: selected.min, max: selected.max },
              });
            }
          }}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {priceRanges.map((range) => (
            <option key={range.id} value={range.id}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onApplyFilters}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={onResetFilters}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
