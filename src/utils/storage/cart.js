const CART_KEY = "sneakers_cart";

// Lấy giỏ hàng từ localStorage
export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

// Lưu giỏ hàng vào localStorage
const saveCart = (cart) => {
  try {
    // Đảm bảo mỗi item trong giỏ hàng có đủ thông tin cần thiết
    const validCart = cart.filter(item => 
      item && 
      item._id && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    ).map(item => ({
      _id: item._id,
      name: item.name || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size || null,
      color: item.color || null,
      images: Array.isArray(item.images) ? item.images : [],
      stock: Number(item.stock) || 0
    }));

    localStorage.setItem(CART_KEY, JSON.stringify(validCart));
    return validCart;
  } catch (error) {
    console.error('Error saving cart:', error);
    return [];
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
  try {
    const cart = getCart();
    
    // Tìm sản phẩm có cùng id, size và color
    const existingItemIndex = cart.findIndex(item => 
      item._id === product._id && 
      item.size === selectedSize && 
      item.color === selectedColor
    );

    // Nếu sản phẩm đã tồn tại, cập nhật số lượng
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity = Math.min(
        cart[existingItemIndex].quantity + quantity,
        product.stock
      );
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm mới
      cart.push({
        _id: product._id,
        name: product.name,
        price: Number(product.price),
        quantity: Math.min(quantity, product.stock),
        size: selectedSize,
        color: selectedColor,
        images: Array.isArray(product.images) ? product.images : [],
        stock: Number(product.stock)
      });
    }

    return saveCart(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return getCart();
  }
};

// Cập nhật số lượng sản phẩm
export const updateCartItemQuantity = (productId, size, color, newQuantity) => {
  try {
    const cart = getCart();
    const item = cart.find(item => 
      item._id === productId && 
      item.size === size && 
      item.color === color
    );

    if (item) {
      if (newQuantity <= 0) {
        // Nếu số lượng = 0, xóa sản phẩm
        return saveCart(cart.filter(item => 
          !(item._id === productId && item.size === size && item.color === color)
        ));
      } else {
        // Cập nhật số lượng mới
        item.quantity = Math.min(newQuantity, item.stock);
        return saveCart(cart);
      }
    }
    return cart;
  } catch (error) {
    console.error('Error updating quantity:', error);
    return getCart();
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId, size, color) => {
  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => 
      !(item._id === productId && 
        item.size === size && 
        item.color === color)
    );
    return saveCart(updatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCart();
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = () => {
  try {
    localStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// Tính tổng tiền giỏ hàng
export const calculateCartTotal = (cart) => {
  try {
    return (cart || []).reduce((total, item) => 
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 
    0);
  } catch (error) {
    console.error('Error calculating total:', error);
    return 0;
  }
};
