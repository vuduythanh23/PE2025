// Debug utility for tracking filter operations
export const FilterDebugger = {
  logFilterChange: (source, filters) => {
    console.group(`🔍 Filter Change - ${source}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Source:', source);
    console.log('Filters:', JSON.stringify(filters, null, 2));
    console.groupEnd();
  },

  logApiCall: (params, url) => {
    console.group('🌐 API Call - getProductsWithFilters');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Parameters:', JSON.stringify(params, null, 2));
    console.log('URL:', url);
    console.groupEnd();
  },

  logApiResponse: (response) => {
    console.group('📥 API Response - getProductsWithFilters');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Total Products:', response.totalProducts);
    console.log('Current Page:', response.currentPage);
    console.log('Total Pages:', response.totalPages);
    console.log('Products Count:', response.products.length);
    console.log('Sample Product:', response.products[0] ? {
      id: response.products[0]._id,
      name: response.products[0].name,
      price: response.products[0].price,
      category: response.products[0].category,
      brand: response.products[0].brand
    } : 'No products');
    console.groupEnd();
  },

  logPaginationState: (currentPage, totalPages, totalProducts, limit) => {
    console.group('📄 Pagination State');
    console.log('Current Page:', currentPage);
    console.log('Total Pages:', totalPages);
    console.log('Total Products:', totalProducts);
    console.log('Limit per page:', limit);
    console.log('Expected products on page:', Math.min(limit, totalProducts - (currentPage - 1) * limit));
    console.groupEnd();
  }
};

// Enable/disable debugging
export const DEBUG_FILTERS = true;
