# Server-Side Filtering Implementation

## Tổng quan
Đã chuyển đổi thành công hệ thống filtering từ front-end sang server-side filtering cho trang Products. Điều này cải thiện hiệu suất và cho phép xử lý datasets lớn hiệu quả hơn.

## Các thay đổi chính

### 1. API Layer (products.js)
- **Thêm function `getProductsWithFilters()`**: Hàm mới để fetch products với filtering và pagination từ server
- **Thêm function `getFilterOptions()`**: Hàm để lấy filter options với product counts (chuẩn bị cho tương lai)

### 2. Products Page (Products.jsx)
#### State Management
- **Loại bỏ `allProducts` state**: Không còn lưu trữ tất cả products ở client
- **Thêm `filtersLoading` state**: Để quản lý loading state khi fetch categories/brands
- **Cập nhật logic**: Mỗi lần apply filters sẽ gọi API mới

#### Filtering Logic
- **Server-side filtering**: Filters được gửi lên server thay vì xử lý ở client
- **API parameters**: 
  - `category`: Category ID filter
  - `brand`: Brand ID filter  
  - `minPrice`/`maxPrice`: Price range filters
  - `sortBy`: Sort criteria
  - `page`/`limit`: Pagination parameters

#### Loading States
- **Filter skeleton**: Hiển thị skeleton loading khi đang fetch categories/brands
- **Product loading**: Loading indicator khi đang fetch products
- **Button states**: Disable buttons khi đang loading

### 3. Filter Component (ProductFilter.jsx)
- **Loading prop**: Nhận loading state từ parent
- **Disabled states**: Disable inputs khi đang loading
- **Visual feedback**: Opacity và pointer events khi loading

### 4. New Components
- **FilterSkeleton.jsx**: Component hiển thị skeleton loading cho filters

## Lợi ích

### Performance
- **Reduced memory usage**: Không lưu trữ tất cả products ở client
- **Faster initial load**: Chỉ fetch page đầu tiên
- **Server-side optimization**: Database có thể tối ưu queries với indexes

### Scalability  
- **Large datasets**: Có thể xử lý thousands of products
- **Pagination**: Server-side pagination giảm bandwidth
- **Caching potential**: Server có thể cache filtered results

### User Experience
- **Consistent performance**: Không bị chậm khi có nhiều products
- **Real-time updates**: Filters reflect actual database state
- **Progressive loading**: Better loading states

## API Endpoints được sử dụng

Dựa trên hình ảnh route diagram được cung cấp:

```
GET /api/products?category=<categoryId>&brand=<brandId>&minPrice=<min>&maxPrice=<max>&sortBy=<sort>&page=<page>&limit=<limit>
```

Các endpoint liên quan:
- `/api/products/category/:categoryId` - Filter by category
- `/api/products/brand/:brandId` - Filter by brand  
- `/api/categories` - Get all categories
- `/api/brands` - Get all brands

## Cấu trúc Response

### getProductsWithFilters() Response
```javascript
{
  products: [...],           // Array of product objects
  totalProducts: 150,        // Total number of filtered products  
  currentPage: 1,           // Current page number
  totalPages: 17,           // Total pages available
  hasNextPage: true,        // Whether there's a next page
  hasPrevPage: false        // Whether there's a previous page
}
```

## Testing

### Kiểm tra các trường hợp:
1. **No filters**: Load all products with default pagination
2. **Category filter**: Filter by single category
3. **Brand filter**: Filter by single brand
4. **Price range filter**: Filter by price ranges
5. **Combined filters**: Multiple filters simultaneously
6. **Sorting**: Different sort options with filters
7. **Pagination**: Navigate through pages with active filters
8. **Reset filters**: Clear all filters and return to default state

### Error Handling
- Network errors được handle bởi `handleAsyncOperation`
- Empty results hiển thị appropriate message
- Loading states prevent multiple simultaneous requests

## Cải tiến tương lai

1. **Filter counts**: Hiển thị số products cho mỗi filter option
2. **URL state**: Sync filters với URL parameters 
3. **Filter search**: Search functionality trong category/brand dropdowns
4. **Advanced filters**: Size, color, rating filters
5. **Infinite scroll**: Alternative to pagination
6. **Filter caching**: Cache filter options để improve performance

## Migration Notes

- **Backward compatibility**: Code cũ được backup trong `Products.old.jsx`
- **State preservation**: Temporary filters vẫn work như cũ
- **UI consistency**: Không thay đổi giao diện người dùng
- **Performance improvement**: Significant improvement với large datasets
