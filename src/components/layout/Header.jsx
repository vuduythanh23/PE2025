import { Link } from "react-router-dom";
import { isAuthenticated, logout, isAdmin } from "../../utils";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { toggleCart, isCartBouncing, cartItems, getTotalQuantity } = useCart();
  const totalItems = getTotalQuantity();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="bg-luxury-forest shadow-md px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        {" "}
        <Link
          to="/home"
          className="text-2xl font-bold text-luxury-gold font-serif tracking-wider flex items-center gap-3"
        >
          SNKRSS
          {isAdmin() && (
            <span className="bg-luxury-gold text-luxury-forest px-2 py-1 text-xs font-bold rounded-full animate-pulse">
              ADMIN
            </span>
          )}
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            {/* Home Icon */}
            <li className="group relative">
              {" "}
              <Link
                to="/home"
                className="text-luxury-gold hover:text-luxury-light"
              >
                <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Home
                  </span>
                </div>
              </Link>
            </li>{" "}
            {/* Products Icon */}
            <li className="group relative">
              <Link
                to="/products"
                className="text-luxury-gold hover:text-luxury-light"
              >
                <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Products
                  </span>
                </div>
              </Link>{" "}
            </li>
            {isAuthenticated() ? (
              <>
                {/* Cart Icon */}
                <li className="group relative">
                  <button
                    onClick={toggleCart}
                    className="hover:text-blue-600 flex flex-col items-center"
                  >
                    <div
                      className={`flex flex-col items-center transition-all duration-300 ${
                        isCartBouncing
                          ? "animate-bounce"
                          : "transform group-hover:-translate-y-1"
                      }`}
                    >
                      <span className="relative flex items-center justify-center w-6 h-6 text-luxury-gold">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {totalItems > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform scale-100 transition-transform duration-200">
                            {totalItems}
                          </span>
                        )}
                      </span>
                      <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity text-luxury-gold">
                        Cart
                      </span>
                    </div>{" "}
                  </button>
                </li>
                {/* Admin Dashboard Icon - Only show for admin users */}
                {isAdmin() && (
                  <li className="group relative">
                    <Link
                      to="/admin"
                      className="text-luxury-gold hover:text-luxury-light"
                    >
                      <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Admin
                        </span>
                      </div>
                    </Link>
                  </li>
                )}
                {/* Profile Icon */}
                <li className="group relative">
                  <Link
                    to="/profile"
                    className="text-luxury-gold hover:text-luxury-light"
                  >
                    <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Profile
                      </span>
                    </div>
                  </Link>
                </li>{" "}
                {/* Logout Icon */}
                <li className="group relative">
                  {" "}
                  <button
                    onClick={handleLogout}
                    className="text-luxury-gold hover:text-luxury-light flex flex-col items-center"
                  >
                    <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Logout
                      </span>
                    </div>
                  </button>
                </li>
              </>
            ) : (
              <>
                {" "}
                {/* Login Icon */}
                <li className="group relative">
                  <Link
                    to="/login"
                    className="text-luxury-gold hover:text-luxury-light"
                  >
                    <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="absolute top-full mt-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Login
                      </span>
                    </div>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
