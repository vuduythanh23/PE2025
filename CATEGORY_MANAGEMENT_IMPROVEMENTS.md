# Category Management UI Improvements

## Thay đổi được thực hiện:

### 1. Cập nhật cấu trúc hiển thị table
- **Trước**: Hiển thị Name, Slug, Description, Products, Created At, Actions
- **Sau**: Chỉ hiển thị Name, Parent Category, Description, Products, Actions

### 2. Cải thiện logic xử lý hierarchical categories

#### Tính năng mới:
- **Main Categories (Top Level)**:
  - Hiển thị "None (Top Level)" trong cột Parent Category
  - Hiện nền xanh nhạt để phân biệt
  - Icon đặc biệt để nhận diện main category
  - **Số sản phẩm**: Tổng số sản phẩm của chính nó + tất cả subcategories
  - Hiển thị "(total)" để chỉ rõ đây là tổng số

- **Subcategories**:
  - Hiển thị tên category cha trong cột Parent Category
  - Indent với icon mũi tên để phân biệt
  - **Số sản phẩm**: Chỉ số sản phẩm thuộc trực tiếp subcategory đó

### 3. Cải thiện UX/UI
- Sử dụng màu sắc phân biệt main categories và subcategories
- Icon phân biệt rõ ràng
- Hover effects được cải thiện
- Badge số sản phẩm có màu khác nhau cho main/sub categories

### 4. Logic xử lý dữ liệu
- `buildHierarchicalCategories()`: Function mới để xây dựng cấu trúc hierarchical
- Tự động tính toán tổng số sản phẩm cho main categories
- Xử lý đúng relationship giữa parent và child categories
- Hỗ trợ cả parentCategory dạng string ID và object reference

### 5. Cấu trúc dữ liệu mới cho mỗi category:
```javascript
{
  ...originalCategory,
  productCount: number,           // Tổng số sản phẩm (main) hoặc số riêng (sub)
  ownProductCount: number,        // Số sản phẩm riêng của category đó
  parentCategoryName: string,     // Tên parent category hoặc "None (Top Level)"
  isMainCategory: boolean,        // True nếu là main category
}
```

## Lợi ích:
1. **Dễ quản lý**: Hiển thị rõ ràng structure hierarchical
2. **Thông tin chính xác**: Số sản phẩm được tính đúng cho từng level
3. **UX tốt hơn**: Visual cues giúp admin dễ phân biệt main/sub categories
4. **Tối ưu hiển thị**: Chỉ hiển thị những thông tin cần thiết theo yêu cầu

## API Routes được sử dụng:
- `GET /api/categories` - Lấy tất cả categories
- `GET /api/products` - Lấy products để tính số lượng
- `POST /api/categories` - Tạo category mới
- `PUT /api/categories/:id` - Cập nhật category
- `DELETE /api/categories/:id` - Xóa category

## Tương thích:
- Backward compatible với existing category structure
- Hỗ trợ cả flat và hierarchical category organization
- Hoạt động với existing API endpoints
