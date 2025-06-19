import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import HeroSection from "../components/layout/HeroSection";
import Footer from "../components/layout/Footer";
import FeaturedCollectionSection from "../components/modules/FeaturedCollectionSection";
import NewArrivalsSection from "../components/modules/NewArrivalsSection";
import BrandShowcase from "../components/modules/BrandShowcase";
import FeaturesSection from "../components/modules/FeaturesSection";
import NewsletterSection from "../components/modules/NewsletterSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section với video/hình ảnh động */}
        <HeroSection />
        
        {/* Brand Showcase */}
        <BrandShowcase />
        
        {/* Featured Collection Section */}
        <FeaturedCollectionSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* New Arrivals Section */}
        <NewArrivalsSection />
        
        {/* Newsletter Section */}
        <NewsletterSection />
        
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-luxury-gold to-yellow-500 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-black mb-6">
              Ready to Find Your Perfect Shoes?
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Join the community of sneaker enthusiasts and explore the colorful
              world of footwear
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-black text-luxury-gold font-serif text-lg tracking-wider hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Shop Now
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 border-2 border-black text-black font-serif text-lg tracking-wider hover:bg-black hover:text-luxury-gold transition-all duration-300 transform hover:scale-105"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
