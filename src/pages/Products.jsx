// filepath: c:\Users\LEGION\Desktop\PE2025\SNKRSS\PE2025\src\pages\Products.jsx
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
  
  // Separate states for left panel filters and right panel sorting
  const [activeProductFilters, setActiveProductFilters] = useState({
    category: "",
    brand: "",
    priceRange: { min: null, max: null },
    page: 1,
    limit: 12,
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

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        
        // Check if productsData is an array of arrays and flatten it if needed
        let productsToProcess = productsData;
        if (
          Array.isArray(productsData) &&
          productsData.length > 0 &&
          Array.isArray(productsData[0])
        ) {
          productsToProcess = productsData.flat();
        }
        
        // Filter out null or undefined items
        productsToProcess = productsToProcess.filter(product => product != null);

        // Format and store all products
        const formattedProducts = productsToProcess.map((product) => {
          if (!product) {
            return null;
          }

          // Ensure consistent handling of IDs - convert all to strings for comparison
          const productId = product._id ? product._id.toString() : "";
          
          // Extract category data - handle all possible formats
          const categoryObj = typeof product.category === "object" && product.category;
          const categoryId = categoryObj && categoryObj._id 
            ? categoryObj._id.toString() 
            : (typeof product.category === "string" ? product.category : "");
          const categoryName = categoryObj && categoryObj.name 
            ? categoryObj.name 
            : "";
            // Extract brand data - handle all possible formats
          const brandObj = typeof product.brand === "object" && product.brand;
          let brandId = "";
          let brandName = "";
            // Brand handling optimized based on MongoDB schema 
          // In the schema, brand is defined as mongoose.Schema.Types.ObjectId with ref: 'Brand'
          if (brandObj && brandObj._id) {
            // Case 1: Brand is populated as an object (after populate() in API)
            brandId = String(brandObj._id);
            brandName = brandObj.name || "";
          } else if (typeof product.brand === "string") {
            // Case 2: Brand is a string ID (no populate in API)
            brandId = product.brand;
            // Try to find this brand in the brandsData to get its name
            const foundBrand = brandsData.find(b => b._id && b._id.toString() === brandId);
            brandName = foundBrand ? foundBrand.name : "";
          } else if (product.brand && typeof product.brand === "object") {
            // Case 3: Brand is an object but might have a different structure
            if (product.brand.toString && typeof product.brand.toString === "function") {
              // Handle MongoDB ObjectId directly
              brandId = product.brand.toString();
              const foundBrand = brandsData.find(b => b._id && b._id.toString() === brandId);
              brandName = foundBrand ? foundBrand.name : "";
            }
          } else {
            // console.log(`Product ${product.name} has no recognized brand format:`, product.brand);
          }
            
          return {
            _id: productId,
            name: product.name || "",
            description: product.description || "",
            price: product.price || 0,
            images: Array.isArray(product.images) ? product.images : [],
            category: categoryName,
            brand: brandName,
            categoryId: categoryId,
            brandId: brandId,
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
  
  // Apply filters and sorting to products when activeProductFilters or sortSettings change
  useEffect(() => {
    let result = [...allProducts];

    // Apply category filter
    if (activeProductFilters.category) {
      result = result.filter(product => {
        const matches = 
          product.categoryId === activeProductFilters.category || 
          (product.categoryId && activeProductFilters.category && 
           product.categoryId.toString() === activeProductFilters.category.toString());
        return matches;
      });
    }

    // Apply brand filter
    if (activeProductFilters.brand) {
      result = result.filter(product => {
        const productBrandId = product.brandId ? product.brandId.toString() : "";
        const filterBrandId = activeProductFilters.brand ? activeProductFilters.brand.toString() : "";
        return productBrandId === filterBrandId;
      });
    }
    
    // Apply price range filter
    if (
      activeProductFilters.priceRange.min !== null ||
      activeProductFilters.priceRange.max !== null
    ) {
      result = result.filter((product) => {
        const price = Number(product.price);
        if (isNaN(price)) {
          console.warn("Invalid price for product:", product._id, product.name, product.price);
          return false;
        }
        
        if (
          activeProductFilters.priceRange.min !== null &&
          activeProductFilters.priceRange.max !== null
        ) {
          const passes = 
            price >= activeProductFilters.priceRange.min &&
            (activeProductFilters.priceRange.max === Infinity
              ? true
              : price <= activeProductFilters.priceRange.max);
          return passes;
        } else if (activeProductFilters.priceRange.min !== null) {
          return price >= activeProductFilters.priceRange.min;
        } else if (activeProductFilters.priceRange.max !== null) {
          return price <= activeProductFilters.priceRange.max;
        }
        return true;
      });
    }

    // Apply sorting - now using sortSettings
    result.sort((a, b) => {
      switch (sortSettings.sortBy) {
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
    const endIndex = activeProductFilters.page * activeProductFilters.limit;
    setFilteredProducts(result.slice(startIndex, endIndex));
  }, [allProducts, activeProductFilters, sortSettings]);
  
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
    
    setActiveProductFilters(filtersToApply);
  };

  // Reset both temporary and active filters
  const handleResetFilters = () => {
    const resetFilters = {
      category: "",
      brand: "",
      priceRange: { min: null, max: null },
      page: 1,
      limit: 12,
    };
    setTempFilters(resetFilters);
    setActiveProductFilters(resetFilters);
  };

  // Sort change applies immediately (doesn't wait for Apply button)
  const handleSortChange = (sortValue) => {
    setSortSettings({
      sortBy: sortValue
    });
  };

  // Load more products
  const handleLoadMore = () => {
    setActiveProductFilters((prev) => ({
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
                    sortBy={sortSettings.sortBy} 
                    onSortChange={handleSortChange}
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
