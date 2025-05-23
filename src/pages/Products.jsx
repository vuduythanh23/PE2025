import { useState, useEffect } from "react";
import { getProducts, getCategories, getBrands } from "../utils/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/modules/ProductCard";
import ProductFilter from "../components/modules/ProductFilter";
import ProductSort from "../components/modules/ProductSort";
import Swal from "sweetalert2";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: null, max: null },
    sortBy: "newest",
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to load filters",
          icon: "error",
        });
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts(filters);
        setProducts(data);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to load products",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryId,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleBrandChange = (brandId) => {
    setFilters((prev) => ({
      ...prev,
      brand: brandId,
      page: 1,
    }));
  };

  const handlePriceRangeChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: range,
      page: 1,
    }));
  };

  const handleSortChange = (sortValue) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortValue,
      page: 1,
    }));
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <ProductFilter
              categories={categories}
              brands={brands}
              selectedCategory={filters.category}
              selectedBrand={filters.brand}
              selectedPriceRange={filters.priceRange}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onPriceRangeChange={handlePriceRangeChange}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Products</h1>
              <ProductSort
                sortBy={filters.sortBy}
                onSortChange={handleSortChange}
              />
            </div>

            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>

                {products.length >= filters.limit && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
