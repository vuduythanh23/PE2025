export default function Footer() {
    return (      <footer className="bg-luxury-forest text-luxury-gold py-12 mt-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl mb-4">SNKRSS</h3>
              <p className="text-sm opacity-80">Luxury Sneakers Boutique</p>
            </div>
            <div className="text-center">
              <h4 className="font-serif text-lg mb-4">Contact</h4>
              <p className="text-sm opacity-80">Email: contact@snkrss.com</p>
              <p className="text-sm opacity-80">Phone: +1 (555) 123-4567</p>
            </div>
            <div className="text-center md:text-right">
              <h4 className="font-serif text-lg mb-4">Follow Us</h4>
              <div className="flex justify-center md:justify-end gap-4">
                <a href="#" className="hover:text-luxury-light transition-colors">Instagram</a>
                <a href="#" className="hover:text-luxury-light transition-colors">Facebook</a>
                <a href="#" className="hover:text-luxury-light transition-colors">Twitter</a>
              </div>
            </div>
          </div>
          <div className="border-t border-luxury-gold/20 mt-8 pt-8 text-center text-sm opacity-80">
            &copy; 2025 SNKRSS. All rights reserved.
          </div>
        </div>
      </footer>
    )
  }
  