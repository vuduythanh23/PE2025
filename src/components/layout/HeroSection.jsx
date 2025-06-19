import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero-drag.css";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true); // Removed scrollY and opacity states for scroll effects
  const containerRef = useRef(null);
  const dragThreshold = 100; // Minimum drag distance to trigger slide change
  const heroContent = [
    {
      video:
        "https://player.vimeo.com/external/412031516.hd.mp4?s=2c0c6c5b9b96b7c8a0b0b0b0b0b0b0b0&profile_id=175&oauth2_token_id=57447761",
      fallbackImage:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
      title: "Premium Sneaker Collection",
      subtitle: "Redefine your style with meticulously crafted footwear",
      cta: "Explore Now",
      ctaLink: "/products",
    },
    {
      video: null,
      fallbackImage:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
      title: "Premium Quality",
      subtitle: "Every detail perfected to deliver an exceptional experience",
      cta: "View Collection",
      ctaLink: "/products",
    },
    {
      video: null,
      fallbackImage:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
      title: "Limited Edition",
      subtitle: "Own exclusive designs, crafted for the discerning few",
      cta: "Shop Now",
      ctaLink: "/products",
    },
  ];
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroContent.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroContent.length, isAutoPlay]); // Removed scroll fade effect useEffect

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroContent.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroContent.length) % heroContent.length
    );
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setIsAutoPlay(false);
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const offset = currentX - dragStart;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    document.body.style.userSelect = "";

    if (Math.abs(dragOffset) > dragThreshold) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setDragOffset(0);

    // Resume autoplay after 3 seconds
    setTimeout(() => {
      setIsAutoPlay(true);
    }, 3000);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setIsAutoPlay(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const offset = currentX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (Math.abs(dragOffset) > dragThreshold) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setDragOffset(0);

    // Resume autoplay after 3 seconds
    setTimeout(() => {
      setIsAutoPlay(true);
    }, 3000);
  };

  // Prevent context menu on right click during drag
  const handleContextMenu = (e) => {
    if (isDragging) {
      e.preventDefault();
    }
  };
  return (
    <section
      ref={containerRef}
      className="hero-drag-container relative w-full h-screen overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`hero-slide-container relative w-full h-full ${
          isDragging ? "dragging" : ""
        }`}
        style={{
          transform: isDragging
            ? `translateX(${dragOffset * 0.1}px)`
            : "translateX(0)",
        }}
      >
        {" "}
        {heroContent.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            {/* Video or Image Background */}
            {slide.video ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline                onError={(e) => {
                  e.target.style.display = "none";
                  const fallbackImg = e.target.nextElementSibling;
                  if (fallbackImg) {
                    fallbackImg.style.display = "block";
                  }
                }}
              >
                <source src={slide.video} type="video/mp4" />
              </video>
            ) : null}
            <img
              src={slide.fallbackImage}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover ${
                slide.video ? "hidden" : "block"
              }`}
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />{" "}
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="hero-content-no-select text-center max-w-4xl px-6">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
                  <span className="block opacity-0 animate-[slideInUp_1s_ease-out_0.5s_forwards]">
                    {slide.title.split(" ").slice(0, -2).join(" ")}
                  </span>
                  <span className="block text-luxury-gold opacity-0 animate-[slideInUp_1s_ease-out_0.8s_forwards]">
                    {slide.title.split(" ").slice(-2).join(" ")}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 font-light max-w-2xl mx-auto opacity-0 animate-[fadeInUp_1s_ease-out_1.1s_forwards]">
                  {slide.subtitle}
                </p>

                <div className="opacity-0 animate-[fadeInUp_1s_ease-out_1.4s_forwards]">
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center px-8 py-4 bg-luxury-gold text-black font-serif text-lg tracking-wider hover:bg-white hover:text-luxury-gold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  >
                    {slide.cta}
                    <svg
                      className="ml-3 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>{" "}
          </div>
        ))}
      </div>{" "}
      {/* Navigation Dots */}
      <div className="nav-dots absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {heroContent.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlay(false);
              setTimeout(() => setIsAutoPlay(true), 3000);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-luxury-gold scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>{" "}
      {/* Navigation Arrows */}
      <button
        onClick={() => {
          prevSlide();
          setIsAutoPlay(false);
          setTimeout(() => setIsAutoPlay(true), 3000);
        }}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-luxury-gold hover:text-black transition-all duration-300 group"
      >
        <svg
          className="w-6 h-6 transform group-hover:scale-110 transition-transform"
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
      <button
        onClick={() => {
          nextSlide();
          setIsAutoPlay(false);
          setTimeout(() => setIsAutoPlay(true), 3000);
        }}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-luxury-gold hover:text-black transition-all duration-300 group"
      >
        <svg
          className="w-6 h-6 transform group-hover:scale-110 transition-transform"
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
      </button>{" "}
      {/* Removed scroll indicator since smooth scroll effects were removed */}    </section>
  );
}
