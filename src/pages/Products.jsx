import { useState, useEffect } from "react";
import { getProducts, getCategories, getBrands } from "../utils/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/modules/ProductCard";
import ProductFilter from "../components/modules/ProductFilter";
import ProductSort from "../components/modules/ProductSort";
import Swal from "sweetalert2";

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: null, max: null },
    sortBy: "newest",
    page: 1,
    limit: 12,
  });

  // Temporary filters state that changes as user selects options
  const [tempFilters, setTempFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: null, max: null },
    sortBy: "newest",
    page: 1,
    limit: 12,
  });

  // Fetch initial filter options and all products
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, brandsData, productsData] = await Promise.all([
          getCategories(),
          getBrands(),
          getProducts(),
        ]);

        setCategories(categoriesData);
        setBrands(brandsData);

        // Format and store all products
        const formattedProducts = productsData.map((product) => ({
          _id: product._id || "",
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          images: Array.isArray(product.images) ? product.images : [],
          category:
            typeof product.category === "object"
              ? product.category.name
              : product.category || "",
          brand:
            typeof product.brand === "object"
              ? product.brand.name
              : product.brand || "",
          categoryId:
            typeof product.category === "object"
              ? product.category._id
              : product.category || "",
          brandId:
            typeof product.brand === "object"
              ? product.brand._id
              : product.brand || "",
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          stock: product.stock || 0,
          averageRating: product.averageRating || 0,
        }));

        setAllProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load products and filters",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Apply filters and sorting to products only when activeFilters change
  useEffect(() => {
    let result = [...allProducts];

    // Apply category filter
    if (activeFilters.category) {
      result = result.filter(
        (product) => product.categoryId === activeFilters.category
      );
    }

    // Apply brand filter
    if (activeFilters.brand) {
      result = result.filter(
        (product) => product.brandId === activeFilters.brand
      );
    }

    // Apply price range filter
    if (
      activeFilters.priceRange.min !== null ||
      activeFilters.priceRange.max !== null
    ) {
      result = result.filter((product) => {
        const price = product.price;
        if (
          activeFilters.priceRange.min !== null &&
          activeFilters.priceRange.max !== null
        ) {
          return (
            price >= activeFilters.priceRange.min &&
            (activeFilters.priceRange.max === Infinity
              ? true
              : price <= activeFilters.priceRange.max)
          );
        } else if (activeFilters.priceRange.min !== null) {
          return price >= activeFilters.priceRange.min;
        } else if (activeFilters.priceRange.max !== null) {
          return price <= activeFilters.priceRange.max;
        }
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (activeFilters.sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating_desc":
          return b.averageRating - a.averageRating;
        case "newest":
        default:
          // Assuming newer products have higher IDs
          return b._id.localeCompare(a._id);
      }
    });

    // Apply pagination
    const startIndex = 0;
    const endIndex = activeFilters.page * activeFilters.limit;
    setFilteredProducts(result.slice(startIndex, endIndex));
  }, [allProducts, activeFilters]);

  const handleTempFiltersChange = (newFilters) => {
    setTempFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: "",
      brand: "",
      priceRange: { min: null, max: null },
      sortBy: "newest",
      page: 1,
      limit: 12,
    };
    setTempFilters(resetFilters);
    setActiveFilters(resetFilters);
  };

  const handleSortChange = (sortValue) => {
    // Apply sort immediately without waiting for Apply button
    setActiveFilters((prev) => ({
      ...prev,
      sortBy: sortValue,
    }));
    setTempFilters((prev) => ({
      ...prev,
      sortBy: sortValue,
    }));
  };

  const handleLoadMore = () => {
    setActiveFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
    setTempFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 relative">
            {/* Sticky Sidebar with Filters and Sort */}
            <aside className="md:sticky md:top-4 w-full md:w-72 flex-shrink-0 self-start bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                {/* Sort Section */}
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Sort By
                  </h2>
                  <ProductSort
                    sortBy={tempFilters.sortBy}
                    onSortChange={handleSortChange}
                  />
                </div>

                {/* Filters Section */}
                <ProductFilter
                  categories={categories}
                  brands={brands}
                  selectedCategory={tempFilters.category}
                  selectedBrand={tempFilters.brand}
                  selectedPriceRange={tempFilters.priceRange}
                  onFilterChange={handleTempFiltersChange}
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <span className="text-gray-600">
                  {filteredProducts.length} Products
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-xl text-gray-600">Loading...</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-xl text-gray-600">No products found</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} {...product} />
                    ))}
                  </div>

                  {filteredProducts.length < allProducts.length &&
                    filteredProducts.length >=
                      activeFilters.limit * activeFilters.page && (
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={handleLoadMore}
                          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
