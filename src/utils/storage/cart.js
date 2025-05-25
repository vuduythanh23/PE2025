// Storage key
const CART_KEY = "sneakers_cart";

/**
 * Get cart items from localStorage
 * @returns {Array} Array of cart items
 */
export const getCart = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

/**
 * Save cart items to localStorage
 * @param {Array} cart - Cart items array
 */
const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

/**
 * Add item to cart
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 * @param {string} selectedSize - Selected size
 * @param {string} selectedColor - Selected color
 * @returns {Array} Updated cart
 */
export const addToCart = (
  product,
  quantity = 1,
  selectedSize = null,
  selectedColor = null
) => {
  const cart = getCart();
  const existingItem = cart.find(
    (item) =>
      item.productId === product._id &&
      item.size === selectedSize &&
      item.color === selectedColor
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
      timestamp: new Date().toISOString(),
    });
  }

  saveCart(cart);
  return cart;
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 * @param {string} size - Size
 * @param {string} color - Color
 * @returns {Array} Updated cart
 */
export const removeFromCart = (productId, size, color) => {
  const cart = getCart();
  const updatedCart = cart.filter(
    (item) =>
      !(
        item.productId === productId &&
        item.size === size &&
        item.color === color
      )
  );
  saveCart(updatedCart);
  return updatedCart;
};

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {string} size - Size
 * @param {string} color - Color
 * @param {number} quantity - New quantity
 * @returns {Array} Updated cart
 */
export const updateCartItemQuantity = (productId, size, color, quantity) => {
  const cart = getCart();
  const item = cart.find(
    (item) =>
      item.productId === productId && item.size === size && item.color === color
  );

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId, size, color);
    }
    item.quantity = quantity;
    saveCart(cart);
  }
  return cart;
};

/**
 * Clear entire cart
 */
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

/**
 * Get cart total count
 * @returns {number} Total number of items in cart
 */
export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Get cart total price
 * @returns {number} Total price of all items in cart
 */
export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};
