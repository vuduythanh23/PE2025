const CART_KEY = "sneakers_cart";

export const getCart = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

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

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

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
  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  return updatedCart;
};

export const updateCartItemQuantity = (productId, size, color, quantity) => {
  const cart = getCart();
  const item = cart.find(
    (item) =>
      item.productId === productId && item.size === size && item.color === color
  );

  if (item) {
    item.quantity = quantity;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
