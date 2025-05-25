# Utils Folder Structure

Thư mục `utils` đã được tái cấu trúc và tổ chức lại theo chức năng để dễ dàng quản lý và bảo trì.

## 📁 Cấu trúc thư mục

```
utils/
├── api/              # API calls và HTTP requests
│   ├── auth.js       # Authentication APIs (login, register)
│   ├── base.js       # Base utilities (fetch, retry, headers)
│   ├── brands.js     # Brand management APIs
│   ├── categories.js # Category management APIs
│   ├── orders.js     # Order management APIs
│   ├── products.js   # Product management APIs
│   ├── ratings.js    # Rating và comment APIs
│   ├── users.js      # User management APIs
│   └── index.js      # Re-exports tất cả API functions
├── constants/        # Các hằng số và cấu hình
│   ├── api.js        # API endpoints và configuration
│   └── index.js      # Re-exports constants
├── helpers/          # Utility functions và helpers
│   ├── format.js     # Formatting functions (currency, date, etc.)
│   ├── validation.js # Validation functions
│   └── index.js      # Re-exports helpers
├── storage/          # Local storage và session storage
│   ├── auth.js       # Authentication storage (token, user data)
│   ├── cart.js       # Cart storage management
│   └── index.js      # Re-exports storage functions
└── index.js          # Main export file với backward compatibility
```

## 🔧 Cách sử dụng

### Import từ main utils
```javascript
// Import tất cả từ main utils (recommended)
import { loginUser, getProducts, formatCurrency, getCart } from '../utils';

// Hoặc import specific categories
import { loginUser, registerUser } from '../utils/api';
import { formatCurrency, validateEmail } from '../utils/helpers';
import { getCart, addToCart } from '../utils/storage';
```

### Import từ specific modules
```javascript
// Import trực tiếp từ module cụ thể
import { loginUser } from '../utils/api/auth';
import { formatCurrency } from '../utils/helpers/format';
import { getCart } from '../utils/storage/cart';
```

## 📋 Chi tiết các modules

### 🔐 API Module (`utils/api/`)
- **auth.js**: Login, register user
- **users.js**: User CRUD operations
- **products.js**: Product management và queries
- **brands.js**: Brand management
- **categories.js**: Category management
- **orders.js**: Order management
- **ratings.js**: Product ratings và comments
- **base.js**: HTTP utilities, retry logic, headers

### 💾 Storage Module (`utils/storage/`)
- **auth.js**: Token, user data, admin status management
- **cart.js**: Shopping cart operations

### 🛠 Helpers Module (`utils/helpers/`)
- **format.js**: Currency, date, phone number formatting
- **validation.js**: Form validation functions

### ⚙️ Constants Module (`utils/constants/`)
- **api.js**: API endpoints, configuration, headers

## 🚀 Cải tiến đã thực hiện

### ✅ Tổ chức theo chức năng
- Phân chia code theo domain (API, storage, helpers)
- Mỗi module có trách nhiệm rõ ràng
- Dễ dàng tìm kiếm và bảo trì

### ✅ Backward Compatibility
- Main `index.js` export tất cả functions
- Existing imports vẫn hoạt động
- Không cần thay đổi code hiện tại (đã cập nhật)

### ✅ Enhanced Functionality
- Improved error handling
- Better rate limiting
- Enhanced validation functions
- More formatting options

### ✅ Better Code Organization
- Separation of concerns
- Cleaner file structure
- Easier testing và debugging
- Improved maintainability

## 📝 Migration Guide

Các import cũ đã được cập nhật từ:
```javascript
// Old imports
import { loginUser } from '../utils/api';
import { formatCurrency } from '../utils/format-utils';
import { getCart } from '../utils/cart-utils';
```

Thành:
```javascript
// New imports (already updated)
import { loginUser, formatCurrency, getCart } from '../utils';
```

Tất cả các file đã được cập nhật và ứng dụng hoạt động bình thường.
