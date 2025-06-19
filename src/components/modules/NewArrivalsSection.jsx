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

export default function NewArrivalsSection() {
  const [newProducts, setNewProducts] = useState([]);
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
  // Group products into grids of 8 products (4x2 layout)
  const groupProductsIntoGrids = (products) => {
    const grids = [];
    for (let i = 0; i < products.length; i += 8) {
      grids.push(products.slice(i, i + 8));
    }
    return grids;
  };

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách categories
        const categories = await getCategories();
        
        // Lấy các categories khác với Featured Collection (từ index 2 trở đi)
        const newArrivalCategories = categories.slice(2, 5); // Lấy 3 categories khác
        
        let allNewProducts = [];
        
        // Lấy sản phẩm từ mỗi category
        for (const category of newArrivalCategories) {
          try {
            const products = await getProducts({ 
              category: category._id,
              limit: 4, // Lấy tối đa 4 sản phẩm mỗi category
              sortBy: "newest"
            });
            
            const formattedProducts = formatProductData(products);
            allNewProducts = [...allNewProducts, ...formattedProducts];
          } catch (err) {
            console.error(`Error fetching products for category ${category.name}:`, err);
          }
        }
        
        // Giới hạn tổng số sản phẩm
        const limitedProducts = allNewProducts.slice(0, 12);
        setNewProducts(limitedProducts);
        
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Failed to load new arrivals");
      } finally {
        setLoading(false);
      }
    };    fetchNewArrivals();
  }, []);

  const productGrids = groupProductsIntoGrids(newProducts);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6">
              New Arrivals
            </h2>
            <div className="w-24 h-0.5 bg-luxury-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6">
            New Arrivals
          </h2>
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-luxury-gold/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6">
            New Arrivals
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Stay updated with the latest fashion trends featuring newly launched shoes
          </p>
          <div className="w-24 h-0.5 bg-luxury-gold mx-auto"></div>
        </div>        {/* Products Grid Slider */}
        {productGrids.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.arrivals-swiper-button-next',
              prevEl: '.arrivals-swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.arrivals-swiper-pagination',
            }}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            loop={productGrids.length > 1}
            className="new-arrivals-swiper"
          >
            {productGrids.map((gridProducts, gridIndex) => (
              <SwiperSlide key={gridIndex}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {gridProducts.map((product) => (
                    <div
                      key={product._id}
                      className="group bg-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full"
                    >
                      {/* Product Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={product.images?.[0] || "/placeholder-product.jpg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                        
                        {/* New Badge */}
                        <div className="absolute top-3 left-3 bg-luxury-gold text-black px-2 py-1 text-xs font-bold rounded">
                          NEW
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-serif text-gray-800 mb-1 group-hover:text-luxury-gold transition-colors duration-300 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-luxury-gold font-medium text-sm mb-2">
                          {product.brand}
                        </p>
                        <p className="text-xl font-bold text-luxury-gold mb-4">
                          ${product.price}
                        </p>                        {/* Action Button */}
                        <div className="mt-4">
                          <Link
                            to={`/product/${product._id}`}
                            className="w-full block bg-luxury-gold text-black px-3 py-2 text-center text-sm font-serif tracking-wider hover:bg-white hover:text-luxury-gold border border-luxury-gold transition-all duration-300"
                          >
                            View More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}          </Swiper>
        ) : (
          <div className="text-center text-gray-500">
            <p>No new arrivals available at the moment.</p>
          </div>
        )}

        {/* Custom Navigation */}
        <div className="flex justify-center mt-8 space-x-4">
          <button className="arrivals-swiper-button-prev w-12 h-12 bg-luxury-gold text-black rounded-full flex items-center justify-center hover:bg-white hover:text-luxury-gold border-2 border-luxury-gold transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="arrivals-swiper-button-next w-12 h-12 bg-luxury-gold text-black rounded-full flex items-center justify-center hover:bg-white hover:text-luxury-gold border-2 border-luxury-gold transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Custom Pagination */}
        <div className="arrivals-swiper-pagination flex justify-center mt-6"></div>
      </div>
    </section>
  );
}
