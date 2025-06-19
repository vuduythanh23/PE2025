export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-luxury-forest via-luxury-forest/95 to-luxury-forest/90 text-luxury-gold py-16 mt-16 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-luxury-gold/20 rotate-45"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-luxury-gold/20 rotate-12"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-luxury-gold/30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-luxury-gold/40 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main brand section */}
        <div className="text-center mb-12">
          <h3 className="font-serif text-4xl md:text-5xl mb-3 tracking-wider font-light">
            SNKRSS
          </h3>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-4"></div>
          <p className="text-sm tracking-widest opacity-70 font-light">
            LUXURY SNEAKERS BOUTIQUE
          </p>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {/* Quick Links */}
          <div className="text-center group">
            <h4 className="font-serif text-lg mb-6 tracking-wide opacity-90">
              Quick Links
            </h4>
            <nav className="space-y-3">
              <a
                href="/products"
                className="block text-sm tracking-wide opacity-70 hover:opacity-100 hover:text-luxury-light transition-all duration-300 hover:translate-x-1"
              >
                Browse Collection
              </a>
              <a
                href="/profile"
                className="block text-sm tracking-wide opacity-70 hover:opacity-100 hover:text-luxury-light transition-all duration-300 hover:translate-x-1"
              >
                My Account
              </a>
              <a
                href="/home"
                className="block text-sm tracking-wide opacity-70 hover:opacity-100 hover:text-luxury-light transition-all duration-300 hover:translate-x-1"
              >
                About Us
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="text-center group">
            <h4 className="font-serif text-lg mb-6 tracking-wide opacity-90">
              Connect
            </h4>
            <div className="space-y-3">
              <p className="text-sm opacity-70 hover:opacity-100 transition-opacity duration-300">
                contact@snkrss.com
              </p>
              <p className="text-sm opacity-70 hover:opacity-100 transition-opacity duration-300">
                +1 (555) 123-4567
              </p>
              <div className="flex justify-center gap-6 mt-6">
                <a href="#" className="group/social">
                  <div className="w-10 h-10 border border-luxury-gold/30 rounded-full flex items-center justify-center hover:border-luxury-light hover:bg-luxury-gold/10 transition-all duration-300 group-hover/social:scale-110">
                    <span className="text-xs">IG</span>
                  </div>
                </a>
                <a href="#" className="group/social">
                  <div className="w-10 h-10 border border-luxury-gold/30 rounded-full flex items-center justify-center hover:border-luxury-light hover:bg-luxury-gold/10 transition-all duration-300 group-hover/social:scale-110">
                    <span className="text-xs">FB</span>
                  </div>
                </a>
                <a href="#" className="group/social">
                  <div className="w-10 h-10 border border-luxury-gold/30 rounded-full flex items-center justify-center hover:border-luxury-light hover:bg-luxury-gold/10 transition-all duration-300 group-hover/social:scale-110">
                    <span className="text-xs">TW</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="text-center group">
            <h4 className="font-serif text-lg mb-6 tracking-wide opacity-90">
              Support
            </h4>
            <nav className="space-y-3">
              <a
                href="/home"
                className="block text-sm tracking-wide opacity-70 hover:opacity-100 hover:text-luxury-light transition-all duration-300 hover:translate-x-1"
              >
                Shipping Info
              </a>
              <a
                href="/home"
                className="block text-sm tracking-wide opacity-70 hover:opacity-100 hover:text-luxury-light transition-all duration-300 hover:translate-x-1"
              >
                Returns Policy
              </a>
              <a
                href="/home"
                className="block text-sm tracking-wide opacity-70 hover:opacity-100 hover:text-luxury-light transition-all duration-300 hover:translate-x-1"
              >
                Size Guide
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-luxury-gold/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs tracking-widest opacity-60">
              &copy; 2025 SNKRSS. CRAFTED WITH PASSION.
            </p>
            <div className="flex gap-6 text-xs tracking-wide opacity-60">
              <a
                href="/home"
                className="hover:opacity-100 transition-opacity duration-300"
              >
                Privacy
              </a>
              <a
                href="/home"
                className="hover:opacity-100 transition-opacity duration-300"
              >
                Terms
              </a>
              <a
                href="/home"
                className="hover:opacity-100 transition-opacity duration-300"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
