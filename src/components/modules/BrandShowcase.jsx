import { useState, useEffect } from "react";
import nikeImg from "../../assets/img/nike.svg";
import adidasImg from "../../assets/img/adidas.svg";
import pumaImg from "../../assets/img/puma.svg";
import newBalanceImg from "../../assets/img/new-balance.svg";

export default function BrandShowcase() {
  const [isVisible, setIsVisible] = useState(false);

  const brands = [
    {
      name: "Nike",
      logo: nikeImg,
      description: "Just Do It",
    },
    {
      name: "Adidas",
      logo: adidasImg,
      description: "Impossible is Nothing",
    },
    {
      name: "Puma",
      logo: pumaImg,
      description: "Forever Faster",
    },
    {
      name: "New Balance",
      logo: newBalanceImg,
      description: "Fearlessly Independent",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("brand-showcase");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="brand-showcase" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {" "}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-luxury-gold mb-4">
            Our Brand Partners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're proud to partner with the world's leading brands
          </p>
          <div className="w-24 h-0.5 bg-luxury-gold mx-auto mt-6"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className={`group transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-luxury-gold/30">
                <div className="flex flex-col items-center text-center">                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        // Create a simple text fallback instead of using external service
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.brand-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />                    <div 
                      className="brand-fallback w-full h-full bg-luxury-gold/10 rounded-lg flex items-center justify-center text-luxury-gold font-bold text-lg"
                      style={{ display: 'none' }}
                    >
                      {brand.name.charAt(0)}
                    </div>
                  </div>
                  <h3 className="text-xl font-serif text-gray-800 mb-2">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-luxury-gold transition-colors">
                    {brand.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="brand-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="2" fill="#d4af37" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#brand-pattern)" />
          </svg>
        </div>
      </div>
    </section>
  );
}
