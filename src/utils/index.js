// Main utils index - Re-export organized utilities

// API utilities
export * from "./api/index.js";

// Storage utilities
export * from "./storage/index.js";

// Helper utilities
export * from "./helpers/index.js";

// Constants
export * from "./constants/index.js";

// Configuration checker
export { ConfigChecker } from "./config-checker.js";

// Legacy compatibility - export commonly used functions directly
// This maintains backward compatibility with existing imports
export {
  // Auth functions
  loginUser,
  registerUser,

  // User functions
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,

  // Product functions
  getProducts,
  getProductById,
  getProductsBySearch,
  getProductsByCategory,
  getProductsByBrand,
  getNewArrivals,
  getOnSale,
  getExclusive,
  getComingSoon,
  createProduct,
  updateProduct,
  deleteProduct,

  // Brand functions
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,

  // Category functions
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory, // Order functions
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  normalizeOrderPaymentStatus,
  normalizeOrdersPaymentStatus,

  // Cart API functions
  addItemToCart,
  getUserCart,
  updateItemQuantity,
  removeItemFromCart,
  clearUserCart,

  // Rating functions
  addRating,
  getRatingsByProduct,
  addComment,
  getCommentsByProduct,
} from "./api/index.js";

export {
  // Auth storage
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAdmin,
  setAdmin,
  removeAdmin,
  isAuthenticated,
  logout,
  // Cart storage
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  calculateCartTotal,
} from "./storage/index.js";

export {
  // Format helpers
  formatCurrency,
  formatPhoneNumber,
  capitalizeFirstLetter,
  truncateText,
  formatDate,
  formatNumber,
  formatPercentage,  // Validation helpers
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
  validateCreditCard,
  validateUrl,
  validateNumberRange,
  validateAddress,
  validateCity,
  validateState,
  validatePostalCode,
} from "./helpers/index.js";
