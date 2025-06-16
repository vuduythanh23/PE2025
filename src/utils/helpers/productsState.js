/**
 * Products page state management utility
 * Saves and restores the state of products page including:
 * - Selected category
 * - Filters (brand, price range, etc.)
 * - Search query
 * - Scroll position
 * - Current page
 */

const PRODUCTS_STATE_KEY = 'productsPageState';
const DEBUG = import.meta.env.DEV; // Only log in development

export const saveProductsState = (state) => {
  try {
    const stateToSave = {
      category: state.category || '',
      brand: state.brand || '',
      priceRange: state.priceRange || { min: '', max: '' },
      searchQuery: state.searchQuery || '',
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop || 0,
      currentPage: state.currentPage || 1,
      sortBy: state.sortBy || '',
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(PRODUCTS_STATE_KEY, JSON.stringify(stateToSave));
    if (DEBUG) console.log('💾 Products state saved:', stateToSave);
  } catch (error) {
    console.error('Failed to save products state:', error);
  }
};

export const getProductsState = () => {
  try {
    const savedState = sessionStorage.getItem(PRODUCTS_STATE_KEY);
    if (!savedState) return null;
    
    const state = JSON.parse(savedState);
    
    // Check if state is not too old (expire after 1 hour)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - state.timestamp > ONE_HOUR) {
      clearProductsState();
      return null;
    }
    
    if (DEBUG) console.log('📖 Products state restored:', state);
    return state;
  } catch (error) {
    console.error('Failed to restore products state:', error);
    clearProductsState();
    return null;
  }
};

export const clearProductsState = () => {
  try {
    sessionStorage.removeItem(PRODUCTS_STATE_KEY);
    if (DEBUG) console.log('🗑️ Products state cleared');
  } catch (error) {
    console.error('Failed to clear products state:', error);
  }
};

export const updateProductsState = (partialState) => {
  try {
    const currentState = getProductsState() || {};
    const newState = { ...currentState, ...partialState, timestamp: Date.now() };
    sessionStorage.setItem(PRODUCTS_STATE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.error('Failed to update products state:', error);
  }
};

// Helper to navigate back to products with preserved state
export const navigateToProducts = (navigate, additionalState = {}) => {
  const savedState = getProductsState();
  
  if (savedState) {
    // Build query string from saved state
    const params = new URLSearchParams();
    
    if (savedState.category) params.set('category', savedState.category);
    if (savedState.brand) params.set('brand', savedState.brand);
    if (savedState.searchQuery) params.set('search', savedState.searchQuery);
    if (savedState.priceRange?.min) params.set('minPrice', savedState.priceRange.min);
    if (savedState.priceRange?.max) params.set('maxPrice', savedState.priceRange.max);
    if (savedState.sortBy) params.set('sort', savedState.sortBy);
    if (savedState.currentPage && savedState.currentPage > 1) params.set('page', savedState.currentPage);
    
    // Add any additional state
    Object.entries(additionalState).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    const queryString = params.toString();
    const path = queryString ? `/products?${queryString}` : '/products';
    
    navigate(path, { 
      state: { 
        restoreScrollPosition: savedState.scrollPosition,
        ...additionalState 
      } 
    });
  } else {
    navigate('/products', { state: additionalState });
  }
};
