# Admin Login Redirect Fix

## Vấn đề
Cần sửa lại logic redirect sau khi login để tài khoản admin được chuyển hướng đến trang `/admin`.

## Giải pháp đã thực hiện

### 1. Cải thiện Login.jsx
- **Kiểm tra admin role kép**: Kiểm tra cả `response.user.role === "admin"` và `response.user.isAdmin === true`
- **Lưu trữ session nhất quán**: Lưu cả `userRole`, `user`, và `isAdmin` trong sessionStorage
- **Logic redirect cải thiện**: 
  - Nếu có query parameter `redirect`, sử dụng nó
  - Nếu không, admin redirect đến `/admin`, user thường redirect đến `/products`
- **Thêm console logs**: Để debug quá trình redirect

### 2. Bảo vệ Admin.jsx
- **Thêm useNavigate**: Import React Router navigate hook
- **State quản lý access check**: Thêm `accessCheckCompleted` để theo dõi quá trình kiểm tra
- **Logic redirect security**: Redirect về login nếu user không phải admin (trừ dev mode)
- **Loading state**: Hiển thị loading spinner trong khi kiểm tra quyền truy cập
- **Access denied UI**: Hiển thị thông báo từ chối truy cập (fallback)

### 3. Flow hoạt động mới

#### Login thành công:
1. User login với email/password
2. Backend trả về user data với role
3. Frontend kiểm tra `role === "admin"` hoặc `isAdmin === true`
4. Lưu session data phù hợp
5. Redirect:
   - Admin → `/admin`
   - User thường → `/products`
   - Hoặc theo query parameter `redirect` nếu có

#### Truy cập /admin:
1. Kiểm tra admin status từ session
2. Nếu chưa xác thực → redirect đến `/login?redirect=/admin`
3. Nếu đã xác thực admin → hiển thị admin dashboard
4. Loading state trong quá trình kiểm tra

### 4. Dev Mode Support
- Trong development mode, có thể bypass admin check bằng query parameter `admin=true`
- Có nút "Enable Admin Mode" cho testing
- Console logs để debug

### 5. Security Features
- Double-check admin status với multiple fields
- Session storage được clear và set lại hoàn toàn khi login
- Redirect về login với proper return URL nếu không có quyền

## Files đã thay đổi
- `src/pages/Login.jsx`: Cải thiện logic redirect và admin detection
- `src/pages/Admin.jsx`: Thêm protection và loading states

## Test Cases
1. **Admin login**: Đăng nhập với tài khoản admin → redirect đến `/admin`
2. **User login**: Đăng nhập với tài khoản thường → redirect đến `/products`
3. **Direct admin access**: Truy cập trực tiếp `/admin` khi chưa login → redirect đến login
4. **Return URL**: Login với `?redirect=/admin` → sau khi login redirect đúng về `/admin`

## Console Commands để test
```bash
# Test in browser console after login
console.log("User role:", sessionStorage.getItem("userRole"));
console.log("Is admin:", sessionStorage.getItem("isAdmin"));
console.log("User data:", JSON.parse(sessionStorage.getItem("user")));
```
