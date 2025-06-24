import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../../utils";

/**
 * Component wrapper that automatically redirects admin users to admin dashboard
 * when they try to access regular user pages, but allows navigation from admin area
 */
export default function AdminRedirectWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    // Only redirect if user is authenticated and is admin
    if (isAuthenticated() && isAdmin()) {
      // List of paths that should redirect admin to dashboard
      const redirectPaths = ["/home", "/products", "/"];

      // Only redirect if:
      // 1. Current path is in redirect list
      // 2. Previous location was not from admin area (to allow admin navigation)
      // 3. This is not a navigation from admin dashboard
      if (redirectPaths.includes(location.pathname)) {
        const isFromAdmin = previousLocation.current?.startsWith("/admin");
        const isDirectAccess =
          !previousLocation.current ||
          previousLocation.current === location.pathname;        // Only redirect on direct access or non-admin navigation
        if (
          !isFromAdmin &&
          (isDirectAccess || !previousLocation.current?.startsWith("/admin"))
        ) {
          navigate("/admin", { replace: true });
          return;
        }
      }
    }

    // Update previous location
    previousLocation.current = location.pathname;
  }, [navigate, location.pathname]);

  // Only show loading if we're actually going to redirect
  const shouldRedirect =
    isAuthenticated() &&
    isAdmin() &&
    ["/home", "/products", "/"].includes(location.pathname) &&
    !previousLocation.current?.startsWith("/admin");

  if (shouldRedirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-dark font-serif">
            Redirecting to Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
