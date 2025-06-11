import { useState, useEffect } from "react";
import { getCategories, getBrands } from "../utils";
import { getProductsWithFilters } from "../utils/api/products";
import { FilterDebugger, DEBUG_FILTERS } from "../utils/helpers/filterDebug";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/modules/ProductCard";
import ProductFilter from "../components/modules/ProductFilter";
import ProductSort from "../components/modules/ProductSort";
import FilterSkeleton from "../components/modules/FilterSkeleton";
import { useLoading } from "../context/LoadingContext";
import Swal from "sweetalert2";

export default function Products() {
  // Remove allProducts state as we'll fetch from server each time
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalFilteredProducts, setTotalFilteredProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const { handleAsyncOperation } = useLoading();
  // Active filters that trigger API calls
  const [activeProductFilters, setActiveProductFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: null, max: null },
    page: 1,
    limit: 9,
  });

  const [sortSettings, setSortSettings] = useState({
    sortBy: "newest",
  });

  // Temporary filters state that changes as user selects options in the left panel
  const [tempFilters, setTempFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: null, max: null },
    page: 1,
    limit: 9,
  });
  // Fetch initial filter options (categories and brands)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFiltersLoading(true);
        const [categoriesData, brandsData] = await handleAsyncOperation(
          async () => Promise.all([getCategories(), getBrands()]),
          "Failed to load filter data"
        );

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchInitialData();
  }, [handleAsyncOperation]);

  // Fetch products whenever activeProductFilters or sortSettings change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build API parameters
        const apiParams = {
          page: activeProductFilters.page,
          limit: activeProductFilters.limit,
          sortBy: sortSettings.sortBy,
        };

        // Add filters if they exist
        if (activeProductFilters.category) {
          apiParams.category = activeProductFilters.category;
        }

        if (activeProductFilters.brand) {
          apiParams.brand = activeProductFilters.brand;
        }

        if (activeProductFilters.priceRange.min !== null) {
          apiParams.minPrice = activeProductFilters.priceRange.min;
        }

        if (activeProductFilters.priceRange.max !== null && activeProductFilters.priceRange.max !== Infinity) {
          apiParams.maxPrice = activeProductFilters.priceRange.max;
        }        console.log("Fetching products with params:", apiParams);
        
        if (DEBUG_FILTERS) {
          FilterDebugger.logApiCall(apiParams, 'getProductsWithFilters');
        }

        const result = await handleAsyncOperation(
          async () => getProductsWithFilters(apiParams),
          "Failed to load products"
        );

        console.log("Received products result:", result);
        
        if (DEBUG_FILTERS) {
          FilterDebugger.logApiResponse(result);
          FilterDebugger.logPaginationState(result.currentPage, result.totalPages, result.totalProducts, apiParams.limit);
        }// Format products for display
        const formattedProducts = result.products.map(product => {
          // Handle category display
          let categoryName = "";
          if (product.category) {
            if (typeof product.category === "object" && product.category.name) {
              categoryName = product.category.name;
            } else if (typeof product.category === "string") {
              // For string IDs, we'll leave it empty and let ProductCard handle it
              categoryName = "";
            }
          }

          // Handle brand display
          let brandName = "";
          if (product.brand) {
            if (typeof product.brand === "object" && product.brand.name) {
              brandName = product.brand.name;
            } else if (typeof product.brand === "string") {
              // For string IDs, we'll leave it empty and let ProductCard handle it
              brandName = "";
            }
          }

          return {
            _id: product._id,
            name: product.name || "",
            description: product.description || "",
            price: product.price || 0,
            images: Array.isArray(product.images) ? product.images : [],
            imageUrl: Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : null,
            category: categoryName,
            brand: brandName,
            categoryId: typeof product.category === "object" 
              ? product.category._id 
              : product.category,
            brandId: typeof product.brand === "object" 
              ? product.brand._id 
              : product.brand,
            colors: Array.isArray(product.colors) ? product.colors : [],
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            stock: product.stock || 0,
            averageRating: product.averageRating || 0,
          };
        });

        setFilteredProducts(formattedProducts);
        setTotalFilteredProducts(result.totalProducts);
        setCurrentPage(result.currentPage);
        setTotalPages(result.totalPages);

      } catch (error) {
        console.error("Error fetching products:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load products. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };    fetchProducts();
  }, [activeProductFilters, sortSettings, handleAsyncOperation]);

  // Handler for temporary filter changes (doesn't apply until user clicks Apply)
  const handleTempFiltersChange = (newFilters) => {
    setTempFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };
  // Apply filters from temporary state to active filter state
  const handleApplyFilters = () => {
    const filtersToApply = JSON.parse(JSON.stringify(tempFilters));

    // Make sure brand and category IDs are strings for consistent comparison
    if (filtersToApply.brand) {
      filtersToApply.brand = String(filtersToApply.brand);
    }

    if (filtersToApply.category) {
      filtersToApply.category = String(filtersToApply.category);
    }

    // Reset to page 1 when applying new filters
    filtersToApply.page = 1;

    if (DEBUG_FILTERS) {
      FilterDebugger.logFilterChange('Apply Filters', {
        from: activeProductFilters,
        to: filtersToApply
      });
    }

    setActiveProductFilters(filtersToApply);
    
    // Scroll to top when applying new filters
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Reset both temporary and active filters
  const handleResetFilters = () => {
    const resetFilters = {
      category: "",
      brand: "",
      priceRange: { min: null, max: null },
      page: 1,
      limit: 9,
    };
    setTempFilters(resetFilters);
    setActiveProductFilters(resetFilters);
  };

  // Sort change applies immediately (doesn't wait for Apply button)
  const handleSortChange = (sortValue) => {
    setSortSettings({
      sortBy: sortValue,
    });
    // Reset to page 1 when changing sort
    setActiveProductFilters((prev) => ({
      ...prev,
      page: 1,
    }));
    
    // Scroll to top when changing sort
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setActiveProductFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    
    // Scroll to top of page when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Calculate display info
  const startIndex = (currentPage - 1) * activeProductFilters.limit + 1;
  const endIndex = Math.min(currentPage * activeProductFilters.limit, totalFilteredProducts);

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-luxury-forest/5 to-luxury-light/5 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif text-luxury-gold mb-4">
              Collection
            </h1>
            <div className="w-24 h-0.5 bg-luxury-gold mx-auto"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filters Sidebar */}
            <aside className="lg:w-1/4">
              <div className="bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">                <h2 className="text-2xl font-serif text-luxury-dark mb-8">
                  Filters
                </h2>
                {filtersLoading ? (
                  <FilterSkeleton />
                ) : (
                  <ProductFilter
                    categories={categories}
                    brands={brands}
                    selectedCategory={tempFilters.category}
                    selectedBrand={tempFilters.brand}
                    selectedPriceRange={tempFilters.priceRange}
                    onFilterChange={handleTempFiltersChange}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                    loading={loading}
                  />
                )}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="w-full sm:w-64">
                  <ProductSort
                    sortBy={sortSettings.sortBy}
                    onSortChange={handleSortChange}
                  />
                </div>
                <p className="text-luxury-dark/70 font-serif">
                  Showing {filteredProducts.length > 0 ? startIndex : 0} - {endIndex} of {totalFilteredProducts} products
                </p>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-xl text-luxury-gold/50 font-serif">
                    Loading products...
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-luxury-dark/70 font-serif mb-4">
                    No products found matching your criteria.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors font-serif text-sm tracking-wider"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="group">
                      <ProductCard {...product} />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalFilteredProducts > activeProductFilters.limit && !loading && (
                <div className="flex justify-center items-center mt-12 space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border border-luxury-gold font-serif text-sm tracking-wider transition-colors ${
                      currentPage === 1
                        ? 'text-luxury-gold/50 border-luxury-gold/50 cursor-not-allowed'
                        : 'text-luxury-gold hover:bg-luxury-gold hover:text-white'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPage;
                    
                    // Show first page, last page, current page, and pages around current page
                    const showPage = 
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - currentPage) <= 1;

                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (pageNumber === 2 && currentPage > 4) {
                        return (
                          <span key={pageNumber} className="px-2 py-2 text-luxury-gold/50">
                            ...
                          </span>
                        );
                      }
                      if (pageNumber === totalPages - 1 && currentPage < totalPages - 3) {
                        return (
                          <span key={pageNumber} className="px-2 py-2 text-luxury-gold/50">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 border font-serif text-sm tracking-wider transition-colors ${
                          isCurrentPage
                            ? 'bg-luxury-gold text-white border-luxury-gold'
                            : 'text-luxury-gold border-luxury-gold hover:bg-luxury-gold hover:text-white'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border border-luxury-gold font-serif text-sm tracking-wider transition-colors ${
                      currentPage === totalPages
                        ? 'text-luxury-gold/50 border-luxury-gold/50 cursor-not-allowed'
                        : 'text-luxury-gold hover:bg-luxury-gold hover:text-white'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
