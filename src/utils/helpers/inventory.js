/**
 * Inventory management utilities for color-size combinations
 */

/**
 * Get available sizes for a specific color
 * @param {Object} product - Product object
 * @param {string} selectedColor - Selected color name
 * @returns {Array} Array of available sizes with stock info
 */
export const getAvailableSizesForColor = (product, selectedColor) => {
  if (!product?.sizes || !product?.colors) return [];

  // Find the selected color
  const colorData = product.colors.find((c) => c.color === selectedColor);
  if (!colorData) return [];

  // Get all sizes and check availability for this color
  return product.sizes.map((size) => {
    // Check if this color-size combination has stock
    // For now, we'll use a simple calculation based on color stock and size availability
    // In a real app, you'd have a proper inventory matrix
    let availableStock = 0;

    if (colorData.stock > 0 && size.stock > 0) {
      // Simple formula: min of color stock and size stock
      availableStock = Math.min(colorData.stock, size.stock);
    }

    return {
      ...size,
      availableStock,
      isAvailable: availableStock > 0,
    };
  });
};

/**
 * Get available colors for a specific size
 * @param {Object} product - Product object
 * @param {string} selectedSize - Selected size
 * @returns {Array} Array of available colors with stock info
 */
export const getAvailableColorsForSize = (product, selectedSize) => {
  if (!product?.sizes || !product?.colors) return [];

  // Find the selected size
  const sizeData = product.sizes.find((s) => s.size === selectedSize);
  if (!sizeData) return [];

  // Get all colors and check availability for this size
  return product.colors.map((color) => {
    // Check if this color-size combination has stock
    let availableStock = 0;

    if (color.stock > 0 && sizeData.stock > 0) {
      // Simple formula: min of color stock and size stock
      availableStock = Math.min(color.stock, sizeData.stock);
    }

    return {
      ...color,
      availableStock,
      isAvailable: availableStock > 0,
    };
  });
};

/**
 * Get stock for a specific color-size combination
 * @param {Object} product - Product object
 * @param {string} selectedColor - Selected color name
 * @param {string} selectedSize - Selected size
 * @returns {number} Available stock for this combination
 */
export const getStockForColorSize = (product, selectedColor, selectedSize) => {
  if (!product?.sizes || !product?.colors || !selectedColor || !selectedSize)
    return 0;

  const colorData = product.colors.find((c) => c.color === selectedColor);
  const sizeData = product.sizes.find((s) => s.size === selectedSize);

  if (!colorData || !sizeData) return 0;

  // Return the minimum stock between color and size
  return Math.min(colorData.stock, sizeData.stock);
};

/**
 * Check if a color-size combination is available
 * @param {Object} product - Product object
 * @param {string} selectedColor - Selected color name
 * @param {string} selectedSize - Selected size
 * @returns {boolean} True if combination is available
 */
export const isColorSizeAvailable = (product, selectedColor, selectedSize) => {
  return getStockForColorSize(product, selectedColor, selectedSize) > 0;
};

/**
 * Get all available color-size combinations
 * @param {Object} product - Product object
 * @returns {Array} Array of available combinations
 */
export const getAvailableCombinations = (product) => {
  if (!product?.sizes || !product?.colors) return [];

  const combinations = [];

  product.colors.forEach((color) => {
    product.sizes.forEach((size) => {
      const stock = getStockForColorSize(product, color.color, size.size);
      if (stock > 0) {
        combinations.push({
          color: color.color,
          size: size.size,
          stock,
          colorHexcode: color.hexcode,
          colorImages: color.images,
        });
      }
    });
  });

  return combinations;
};

/**
 * Validate if selected color and size combination is valid
 * @param {Object} product - Product object
 * @param {string} selectedColor - Selected color name
 * @param {string} selectedSize - Selected size
 * @returns {Object} Validation result with isValid and message
 */
export const validateColorSizeSelection = (
  product,
  selectedColor,
  selectedSize
) => {
  // Check if product has colors and user selected a color
  if (product?.colors?.length > 0 && !selectedColor) {
    return {
      isValid: false,
      message: "Please select a color",
    };
  }

  // Check if product has sizes and user selected a size
  if (product?.sizes?.length > 0 && !selectedSize) {
    return {
      isValid: false,
      message: "Please select a size",
    };
  }

  // Check if combination is available
  if (selectedColor && selectedSize) {
    const stock = getStockForColorSize(product, selectedColor, selectedSize);
    if (stock === 0) {
      return {
        isValid: false,
        message: `Sorry, ${selectedColor} in size ${selectedSize} is out of stock`,
      };
    }
  }

  return {
    isValid: true,
    message: "Selection is valid",
  };
};
