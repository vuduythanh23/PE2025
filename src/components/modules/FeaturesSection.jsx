import { useState, useEffect, useRef } from "react";
import { CountUp } from "countup.js";

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsRef = useRef(null);
  const sectionRef = useRef(null);
  const stats = [
    { number: 1000, suffix: "+", label: "Happy Customers", id: "stat-1" },
    { number: 100, suffix: "+", label: "Authentic Products", id: "stat-2" },
    { number: 10, suffix: "+", label: "Categories", id: "stat-3" },
    { number: 99, suffix: "%", label: "Positive Reviews", id: "stat-4" },
  ];

  const features = [
    {
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      title: "Premium Quality",
      description:
        "Each product is carefully selected to ensure the highest quality for our customers.",
    },
    {
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Fast Delivery",
      description:
        "24-hour delivery in major cities and 2-3 days nationwide with professional shipping.",
    },
    {
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Authentic Warranty",
      description:
        "All products come with authentic warranty and 30-day return support.",
    },
    {
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
      title: "24/7 Support",
      description:
        "Our support team is always ready to assist you anytime, anywhere for the best shopping experience.",
    },
  ];
  useEffect(() => {
    let observer = null;
    let statsObserver = null;

    // Main section observer
    const handleSectionIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }; // Stats section observer
    const handleStatsIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);

          // Animate each stat with CountUp
          stats.forEach((stat, index) => {
            setTimeout(() => {
              const element = document.getElementById(stat.id);
              if (element && element.isConnected) {
                // Check if element is still in DOM
                try {
                  const countUp = new CountUp(stat.id, stat.number, {
                    duration: 3,
                    useEasing: true,
                    useGrouping: true,
                    suffix: stat.suffix,
                    startVal: 0,
                  });
                  if (!countUp.error) {
                    countUp.start();
                  }
                } catch (error) {
                  console.warn("CountUp animation failed:", error);
                }
              }
            }, index * 200);
          });
        }
      });
    };

    // Create observers
    observer = new IntersectionObserver(handleSectionIntersection, {
      threshold: 0.1,
    });

    statsObserver = new IntersectionObserver(handleStatsIntersection, {
      threshold: 0.5,
      rootMargin: "0px 0px -50px 0px",
    });

    // Observe elements
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (statsRef.current) {
      statsObserver.observe(statsRef.current);
    }

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (statsObserver) {
        statsObserver.disconnect();
      }
    };
  }, []); // Empty dependency array to run only once
  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-luxury-gold/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          {" "}
          <h2
            className={`text-4xl md:text-5xl font-serif text-luxury-gold mb-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Why Choose Us?
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            We are committed to providing the best shopping experience with
            professional service and high-quality products
          </p>
          <div
            className={`w-24 h-0.5 bg-luxury-gold mx-auto mt-6 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${400 + index * 150}ms` }}
            >
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-luxury-gold/30 h-full">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-luxury-gold to-luxury-gold/80 rounded-2xl flex items-center justify-center text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-serif text-gray-800 mb-4 group-hover:text-luxury-gold transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>{" "}
        {/* Stats Section */}
        <div
          ref={statsRef}
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {" "}
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div
                id={stat.id}
                className="text-3xl md:text-4xl font-bold text-luxury-gold mb-2 stat-number"
              >
                0
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
