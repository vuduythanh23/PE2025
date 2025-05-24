import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Carousel from "../components/layout/Carousel";
import Footer from "../components/layout/Footer";
import ProductShowcase from "../styles/components/ProductShowcase";
import { getProducts } from "../utils/api";
import Swal from "sweetalert2";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Get latest products, limited to 6
        const data = await getProducts({
          sortBy: "newest",
          limit: 6,
        });

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
        Swal.fire({
          title: "Error",
          text: "Failed to load featured products",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <Header />
      <main>
        <Carousel />

        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Sneakers
            </h2>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Products →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading...</div>
            </div>
          ) : (
            <ProductShowcase products={featuredProducts} />
          )}

          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
