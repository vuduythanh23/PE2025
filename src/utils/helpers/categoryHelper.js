/**
 * Category Helper Utilities
 * Handles category hierarchy and filtering logic
 */

/**
 * Get all subcategory IDs for a given main category
 * @param {Array} categories - All categories array
 * @param {string} mainCategoryId - The main category ID
 * @returns {Array} Array of subcategory IDs including the main category ID
 */
export function getSubcategoryIds(categories, mainCategoryId) {
  if (!categories || !Array.isArray(categories) || !mainCategoryId) {
    return [mainCategoryId].filter(Boolean);
  }

  // Find the main category
  const mainCategory = categories.find(
    (cat) => cat._id.toString() === mainCategoryId.toString()
  );

  if (!mainCategory) {
    console.log(`🚨 Main category ${mainCategoryId} not found`);
    return [mainCategoryId];
  }

  console.log(
    `🏷️ Processing category: ${mainCategory.name} (type: ${mainCategory.type}, parent: ${mainCategory.parent})`
  );

  // If it's already a subcategory (has parent), return just its ID
  if (mainCategory.parent || mainCategory.type === "sub") {
    console.log(
      `📋 Subcategory detected, returning single ID: ${mainCategoryId}`
    );
    return [mainCategoryId];
  }

  // If it's a main category, find all its subcategories
  const subcategoryIds = categories
    .filter((cat) => {
      // Check if this category has the main category as parent
      const parentId = cat.parent?._id || cat.parent;
      return parentId && parentId.toString() === mainCategoryId.toString();
    })
    .map((cat) => cat._id.toString());

  console.log(
    `📂 Main category ${mainCategory.name} has ${subcategoryIds.length} subcategories:`,
    subcategoryIds
  );

  // Return main category ID + all subcategory IDs
  return [mainCategoryId, ...subcategoryIds];
}

/**
 * Check if a product belongs to a category or its subcategories
 * @param {Object} product - Product object
 * @param {string} selectedCategoryId - Selected category ID
 * @param {Array} categories - All categories array
 * @returns {boolean} True if product matches the category or its subcategories
 */
export function doesProductMatchCategory(
  product,
  selectedCategoryId,
  categories
) {
  if (!product || !selectedCategoryId) {
    return true; // No filter applied
  }

  const productCategoryId =
    typeof product.category === "object"
      ? product.category._id
      : product.category;

  if (!productCategoryId) {
    console.log(`❌ Product ${product.name || "unnamed"} has no category`);
    return false;
  }

  // Get all relevant category IDs (main + subcategories)
  const relevantCategoryIds = getSubcategoryIds(categories, selectedCategoryId);

  console.log(
    `🔍 Checking product ${
      product.name || "unnamed"
    } (category: ${productCategoryId}) against categories: [${relevantCategoryIds.join(
      ", "
    )}]`
  );

  // Check if product's category matches any of the relevant categories
  const matches = relevantCategoryIds.some(
    (catId) => catId.toString() === productCategoryId.toString()
  );

  console.log(`✅ Product match result: ${matches}`);
  return matches;
}

/**
 * Check if a category is a main category (has no parent and type is 'main')
 * @param {Object} category - Category object
 * @returns {boolean} True if it's a main category
 */
export function isMainCategory(category) {
  if (!category) return false;

  // Check by type field
  if (category.type === "main") return true;
  if (category.type === "sub") return false;

  // Fallback: check if it has no parent
  return !category.parent;
}

/**
 * Build category query parameters for API calls
 * @param {string} selectedCategoryId - Selected category ID
 * @param {Array} categories - All categories array
 * @returns {Object} Query parameters object
 */
export function buildCategoryQueryParams(selectedCategoryId, categories) {
  if (!selectedCategoryId || selectedCategoryId === "") {
    return {};
  }

  // Find the selected category
  const selectedCategory = categories.find(
    (cat) => cat._id.toString() === selectedCategoryId.toString()
  );

  if (!selectedCategory) {
    return { category: selectedCategoryId };
  }

  // If it's a main category, we need to handle it differently
  if (isMainCategory(selectedCategory)) {
    // For main categories, we'll handle filtering client-side
    // because the API might not support querying by multiple category IDs
    return {
      category: selectedCategoryId,
      isMainCategory: true,
    };
  }

  // For subcategories, use direct category filter
  return { category: selectedCategoryId };
}
