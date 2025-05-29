import { useState, useEffect } from "react";
import { getProducts, getCategories, getBrands } from "../utils";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/modules/ProductCard";
import ProductFilter from "../components/modules/ProductFilter";
import ProductSort from "../components/modules/ProductSort";
import { useLoading } from "../context/LoadingContext";
import Swal from "sweetalert2";

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const { handleAsyncOperation } = useLoading();
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
        const [categoriesData, brandsData, productsData] =
          await handleAsyncOperation(
            async () =>
              Promise.all([getCategories(), getBrands(), getProducts()]),
            "Failed to load products data"
          );

        setCategories(categoriesData);        setBrands(brandsData);
        
        // Check if productsData is an array of arrays and flatten it if needed
        let productsToProcess = productsData;
        if (
          Array.isArray(productsData) &&
          productsData.length > 0 &&
          Array.isArray(productsData[0])
        ) {
          console.log("Flattening nested array of products");
          productsToProcess = productsData.flat();
        }
        
        // Filter out null or undefined items
        productsToProcess = productsToProcess.filter(product => product != null);
        
        if (productsToProcess.length === 0) {
          console.warn("No valid products after filtering");
          return;
        }

        console.log("Processing products:", productsToProcess);

        // Format and store all products
        const formattedProducts = productsToProcess.map((product) => {
          if (!product) {
            console.warn("Skipping null product");
            return null;
          }
          
          return {
            _id: product._id || "",
            name: product.name || "",
            description: product.description || "",
            price: product.price || 0,
            images: Array.isArray(product.images) ? product.images : [],
            category:
              typeof product.category === "object" && product.category
                ? product.category.name || ""
                : product.category || "",
            brand:
              typeof product.brand === "object" && product.brand
                ? product.brand.name || ""
                : product.brand || "",
            categoryId:
              typeof product.category === "object" && product.category
                ? product.category._id || ""
                : product.category || "",
            brandId:
              typeof product.brand === "object" && product.brand
                ? product.brand._id || ""
                : product.brand || "",
            colors: Array.isArray(product.colors) ? product.colors : [],
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            stock: product.stock || 0,
            averageRating: product.averageRating || 0,
          };
        }).filter(item => item !== null); // Filter out any null items after mapping

        setAllProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } catch (error) {
        // Error will be handled by handleAsyncOperation
      }
    };

    fetchInitialData();
  }, [handleAsyncOperation]);

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
            <aside className="lg:w-1/4 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-fit">
              <h2 className="text-2xl font-serif text-luxury-dark mb-8">
                Filters
              </h2>
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
            </aside>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="w-full sm:w-64">
                  <ProductSort
                    sortBy={tempFilters.sortBy}
                    onSortChange={(value) =>
                      handleTempFiltersChange({ sortBy: value })
                    }
                  />
                </div>
                <p className="text-luxury-dark/70 font-serif">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "Product" : "Products"}
                </p>
              </div>{" "}
              {filteredProducts.length === 0 && allProducts.length > 0 ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-xl text-luxury-gold/50 font-serif">
                    No products match your filters
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-xl text-luxury-gold/50 font-serif">
                    Loading...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="group">
                      <ProductCard {...product} />
                    </div>
                  ))}
                </div>
              )}{" "}
              {filteredProducts.length === 0 && allProducts.length > 0 && (
                <div className="text-center py-16">
                  <p className="text-xl text-luxury-dark/70 font-serif">
                    No products found matching your criteria.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors font-serif text-sm tracking-wider"
                  >
                    Reset Filters
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
