import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Carousel from "../components/layout/Carousel";
import Footer from "../components/layout/Footer";
import ProductShowcase from "../styles/components/ProductShowcase";
import { getProducts } from "../utils";
import { useLoading } from "../context/LoadingContext";
import Swal from "sweetalert2";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const { handleAsyncOperation } = useLoading();

  // Format product data to ensure consistent structure
  const formatProductData = (productsData) => {
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) {
      return [];
    }
    
    // Check if data is an array of arrays and flatten it if needed
    let productsToProcess = productsData;
    if (Array.isArray(productsData) && productsData.length > 0 && Array.isArray(productsData[0])) {
      productsToProcess = productsData.flat();
    }
    
    // Filter out null or undefined items
    productsToProcess = productsToProcess.filter(product => product != null);
    
    if (productsToProcess.length === 0) {
      return [];
    }

    // Format the products data to ensure proper structure
    return productsToProcess.map((product) => {
      if (!product) return null;
      
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
        colors: Array.isArray(product.colors) ? product.colors : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        stock: product.stock || 0,
        averageRating: product.averageRating || 0,
      };
    }).filter(item => item !== null);
  };
    // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log("Starting to fetch featured products");
        const data = await handleAsyncOperation(async () => {
          // Sử dụng getProducts có sẵn từ utils thay vì gọi fetch trực tiếp
          // Sắp xếp theo hàng mới nhất và giới hạn 3 sản phẩm
          const response = await getProducts({
            sortBy: "newest",
            limit: 3
          });
          
          console.log("Featured products response:", response);
          return response;
        }, "Failed to load featured products");

        const formattedProducts = formatProductData(data).slice(0, 3); // Limit to 3 products
        console.log("Formatted featured products:", formattedProducts);
        setFeaturedProducts(formattedProducts);
      } catch (error) {
        console.error("Error in fetchFeaturedProducts:", error);
        // Error will be handled by handleAsyncOperation
      }
    };    fetchFeaturedProducts();
  }, [handleAsyncOperation, getProducts]);// Fetch new arrivals
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        console.log("Starting to fetch new arrivals");        
        const data = await handleAsyncOperation(async () => {
          // Sử dụng hàm getProducts có sẵn từ utils với tham số khác để có danh sách sản phẩm khác
          const response = await getProducts({
            sortBy: "popular", // Sử dụng tham số sortBy khác để có danh sách khác
            limit: 3
          });
          
          console.log("New arrivals response:", response);
          return response;
        }, "Failed to load new arrivals");

        const formattedProducts = formatProductData(data).slice(0, 3); // Limit to 3 products
        console.log("Formatted new arrivals:", formattedProducts);
        setNewArrivals(formattedProducts);
      } catch (error) {
        console.error("Error in fetchNewArrivals:", error);
        // Error will be handled by handleAsyncOperation
      }
    };    fetchNewArrivals();
  }, [handleAsyncOperation, getProducts]);
  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-luxury-forest/5 to-luxury-light/5">
        <Carousel />
        <div className="container mx-auto px-4 py-16">
          {/* Featured Collection Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-luxury-gold mb-4">
              Featured Collection
            </h2>
            <div className="w-24 h-0.5 bg-luxury-gold mx-auto mb-8"></div>
            <Link
              to="/products"
              className="text-luxury-gold hover:text-luxury-light transition-colors font-serif text-lg"
            >
              View All Products →
            </Link>
          </div>
          
          {featuredProducts.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-xl text-luxury-gold/50 font-serif">
                Loading...
              </div>
            </div>
          ) : (
            <ProductShowcase products={featuredProducts} />
          )}

          {/* New Arrivals Section */}
          <div className="text-center mb-16 mt-32">
            <h2 className="text-4xl font-serif text-luxury-gold mb-4">
              New Arrivals
            </h2>
            <div className="w-24 h-0.5 bg-luxury-gold mx-auto mb-8"></div>
            <Link
              to="/products"
              className="text-luxury-gold hover:text-luxury-light transition-colors font-serif text-lg"
            >
              Explore More →
            </Link>
          </div>
          
          {newArrivals.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-xl text-luxury-gold/50 font-serif">
                Loading...
              </div>
            </div>
          ) : (
            <ProductShowcase products={newArrivals} />
          )}

          <div className="mt-20 text-center">
            <Link
              to="/products"
              className="inline-block border-2 border-luxury-gold text-luxury-gold px-12 py-4 hover:bg-luxury-gold hover:text-white transition-colors font-serif tracking-wider"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
