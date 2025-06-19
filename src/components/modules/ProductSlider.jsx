import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ProductCard from "./ProductCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/swiper-custom.css";

export default function ProductSlider({ products, title, subtitle }) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-luxury-gold/50 font-serif">
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  const validProducts = products.filter((p) => p && p._id);

  if (validProducts.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-luxury-gold/50 font-serif">
            No products available
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {title && (
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-luxury-gold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="w-24 h-0.5 bg-luxury-gold mx-auto mt-6"></div>
        </div>
      )}

      <div className="relative group px-12">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination-custom",
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={validProducts.length > 3}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="product-slider"
        >
          {validProducts.map((product, index) => (
            <SwiperSlide key={product._id || index} className="h-auto">
              <div className="product-card-animation">
                <ProductCard {...product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-luxury-gold/20 flex items-center justify-center text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-luxury-gold/20 flex items-center justify-center text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-6 group-hover:translate-x-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Custom Pagination */}
        <div className="swiper-pagination-custom"></div>
      </div>
    </section>
  );
}
