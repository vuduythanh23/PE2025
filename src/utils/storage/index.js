// Re-export all storage utilities
export * from "./auth.js";
export * from "./cart.js";

// Re-export cart functions
export {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  calculateCartTotal,
} from "./cart.js";
