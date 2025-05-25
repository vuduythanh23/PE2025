import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Carousel from "../components/layout/Carousel";
import Footer from "../components/layout/Footer";
import ProductShowcase from "../styles/components/ProductShowcase";
import { getProducts } from "../utils/api";
import { useLoading } from "../context/LoadingContext";
import Swal from "sweetalert2";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { handleAsyncOperation } = useLoading();
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await handleAsyncOperation(
          async () => {
            const response = await getProducts({
              sortBy: "newest",
              limit: 6,
            });
            
            if (!response || !Array.isArray(response)) {
              throw new Error('Invalid response format from server');
            }
            
            return response;
          },
          "Failed to load featured products"
        );

        // Format the products data to ensure proper structure
        const formattedProducts = data.map((product) => ({
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
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          stock: product.stock || 0,
          averageRating: product.averageRating || 0,
        }));

        setFeaturedProducts(formattedProducts);
      } catch (error) {
        // Error will be handled by handleAsyncOperation
      }
    };

    fetchFeaturedProducts();
  }, [handleAsyncOperation]);

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-luxury-forest/5 to-luxury-light/5">
        <Carousel />
        <div className="container mx-auto px-4 py-16">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductShowcase products={featuredProducts} />
          </div>

            <div className="mt-20 text-center">
              <Link
                to="/products"
                className="inline-block border-2 border-luxury-gold text-luxury-gold px-12 py-4 hover:bg-luxury-gold hover:text-white transition-colors font-serif tracking-wider"
              >
                Explore Collection
              </Link>
            </div>          </div>
        </main>
      <Footer />
    </>
  );
}
