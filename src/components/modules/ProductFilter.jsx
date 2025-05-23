export default function ProductFilter({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
}) {
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $100", min: 0, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "$200 - $300", min: 200, max: 300 },
    { label: "Over $300", min: 300, max: Infinity },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Brand</h4>
        <select
          value={selectedBrand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
        <select
          value={JSON.stringify(selectedPriceRange)}
          onChange={(e) => onPriceRangeChange(JSON.parse(e.target.value))}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {priceRanges.map((range, index) => (
            <option
              key={index}
              value={JSON.stringify({ min: range.min, max: range.max })}
            >
              {range.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
