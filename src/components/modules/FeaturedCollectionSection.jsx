import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { getCategories } from "../../utils/api/categories";
import { getProducts } from "../../utils/api/products";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/swiper-custom.css";

export default function FeaturedCollectionSection() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format product data to ensure consistent structure
  const formatProductData = (productsData) => {
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) {
      return [];
    }

    let productsToProcess = productsData;
    if (Array.isArray(productsData) && productsData.length > 0 && Array.isArray(productsData[0])) {
      productsToProcess = productsData.flat();
    }

    productsToProcess = productsToProcess.filter((product) => product != null);

    if (productsToProcess.length === 0) {
      return [];
    }

    return productsToProcess
      .map((product) => {
        if (!product) return null;

        return {
          _id: product._id || "",
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          images: Array.isArray(product.images) ? product.images : [],
          category: typeof product.category === "object" && product.category
            ? product.category.name || ""
            : product.category || "",
          brand: typeof product.brand === "object" && product.brand
            ? product.brand.name || ""
            : product.brand || "",
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          stock: product.stock || 0,
          averageRating: product.averageRating || 0,
        };
      })
      .filter((item) => item !== null);
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách categories
        const categories = await getCategories();
        
        // Lấy 2 categories đầu tiên cho Featured Collection
        const featuredCategories = categories.slice(0, 2);
        
        let allFeaturedProducts = [];
        
        // Lấy sản phẩm từ mỗi category
        for (const category of featuredCategories) {
          try {
            const products = await getProducts({ 
              category: category._id,
              limit: 6, // Lấy tối đa 6 sản phẩm mỗi category
              sortBy: "newest"
            });
            
            const formattedProducts = formatProductData(products);
            allFeaturedProducts = [...allFeaturedProducts, ...formattedProducts];
          } catch (err) {
            console.error(`Error fetching products for category ${category.name}:`, err);
          }
        }
        
        // Giới hạn tổng số sản phẩm và đảm bảo có ít nhất 9 sản phẩm để chia thành 3 slides
        const limitedProducts = allFeaturedProducts.slice(0, 12);
        setFeaturedProducts(limitedProducts);
        
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Chia sản phẩm thành các nhóm 3 sản phẩm cho mỗi slide
  const groupProductsIntoSlides = (products) => {
    const slides = [];
    for (let i = 0; i < products.length; i += 3) {
      slides.push(products.slice(i, i + 3));
    }
    return slides;
  };

  const productSlides = groupProductsIntoSlides(featuredProducts);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6">
              Featured Collection
            </h2>
            <div className="w-24 h-0.5 bg-luxury-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6">
            Featured Collection
          </h2>
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-luxury-gold/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6">
            Featured Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Discover the most beloved shoes with unique designs and superior quality
          </p>
          <div className="w-24 h-0.5 bg-luxury-gold mx-auto"></div>
        </div>

        {/* Products Slider */}
        {productSlides.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.featured-swiper-button-next',
              prevEl: '.featured-swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.featured-swiper-pagination',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={productSlides.length > 1}
            className="featured-collection-swiper"
          >
            {productSlides.map((slideProducts, slideIndex) => (
              <SwiperSlide key={slideIndex}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {slideProducts.map((product) => (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={product.images?.[0] || "/placeholder-product.jpg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-serif text-gray-800 mb-2 group-hover:text-luxury-gold transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-luxury-gold font-medium mb-4">
                          {product.brand}
                        </p>
                        <p className="text-2xl font-bold text-luxury-gold mb-6">
                          ${product.price}
                        </p>                        {/* Action Button */}
                        <div className="mt-6">
                          <Link
                            to={`/product/${product._id}`}
                            className="w-full block bg-luxury-gold text-black px-4 py-3 text-center font-serif tracking-wider hover:bg-white hover:text-luxury-gold border-2 border-luxury-gold transition-all duration-300"
                          >
                            View More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center text-gray-500">
            <p>No featured products available at the moment.</p>
          </div>
        )}

        {/* Custom Navigation */}
        <div className="flex justify-center mt-8 space-x-4">
          <button className="featured-swiper-button-prev w-12 h-12 bg-luxury-gold text-black rounded-full flex items-center justify-center hover:bg-white hover:text-luxury-gold border-2 border-luxury-gold transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="featured-swiper-button-next w-12 h-12 bg-luxury-gold text-black rounded-full flex items-center justify-center hover:bg-white hover:text-luxury-gold border-2 border-luxury-gold transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Custom Pagination */}
        <div className="featured-swiper-pagination flex justify-center mt-6"></div>
      </div>
    </section>
  );
}
