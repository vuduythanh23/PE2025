# Utils Directory - Enhanced Configuration & Environment Management

## 📁 Structure Overview

```
src/utils/
├── index.js                 # Main export file with backward compatibility
├── config-checker.js        # Configuration validation utility ✨ NEW
├── README.md               # This documentation
├── api/                    # API-related utilities
│   ├── auth.js            # Authentication API calls
│   ├── base.js            # Base HTTP utilities (timeout, retry, rate limiting)
│   ├── brands.js          # Brand management API
│   ├── categories.js      # Category management API  
│   ├── orders.js          # Order management API
│   ├── products.js        # Product management API
│   ├── ratings.js         # Rating and review API
│   ├── users.js           # User management API
│   └── index.js           # API exports
├── constants/             # Application constants
│   ├── api.js             # API configuration and constants ✨ ENHANCED
│   └── index.js           # Constants exports
├── helpers/               # Helper utilities
│   ├── environment.js     # Environment detection and validation ✨ NEW
│   ├── format.js          # Data formatting utilities
│   ├── validation.js      # Form validation utilities
│   └── index.js           # Helper exports
└── storage/               # Browser storage utilities
    ├── auth.js            # Authentication storage
    ├── cart.js            # Shopping cart storage
    └── index.js           # Storage exports
```

## 🚀 Key Features

### ✨ NEW: Environment Configuration
- **Environment Variables**: Full support for `.env` configuration
- **Environment Detection**: Automatic development/production mode detection
- **Configuration Validation**: Startup validation of all configuration
- **Debug Logging**: Configurable logging with environment-aware levels

### Enhanced API Features
- **Rate Limiting**: Built-in request rate limiting
- **Retry Logic**: Automatic retry with exponential backoff
- **Timeout Handling**: Configurable request timeouts
- **Error Handling**: Structured error responses and logging
- **Environment-aware Logging**: Smart logging based on environment ✨ NEW

### Backward Compatibility
- **Legacy Support**: All old import patterns still work
- **Gradual Migration**: Can migrate imports gradually without breaking changes
- **Direct Exports**: Common functions available directly from main index

## 🔧 Configuration

### Environment Variables (.env) ✨ NEW
```bash
# API Configuration
VITE_API_URL=https://your-api-domain.com/api
VITE_API_TIMEOUT=15000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RATE_LIMIT=10
VITE_API_RATE_INTERVAL=1000

# App Configuration  
VITE_APP_NAME=ShoeShop
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development

# Debug Settings
VITE_DEBUG_MODE=false
VITE_ENABLE_LOGGING=true
```

### Configuration Files
- **`.env`**: Current environment configuration
- **`.env.example`**: Template with all available variables ✨ NEW

## 📝 Usage Examples

### ✨ NEW: Configuration Checker
```javascript
import { ConfigChecker } from '../utils';

// Validate configuration on app startup
const validation = await ConfigChecker.validate();

// Get current status
const status = ConfigChecker.getStatus();
```

### ✨ NEW: Environment Utilities
```javascript
import { Environment, Logger } from '../utils';

// Environment checks
if (Environment.isDevelopment()) {
  Logger.log('Running in development mode');
}

// Get configuration
const apiConfig = Environment.getAPIConfig();
const appInfo = Environment.getAppInfo();

// Validate configuration
const validation = Environment.validateConfig();
```

### Import Patterns

#### New Modular Imports (Recommended)
```javascript
// Import specific modules
import { loginUser, registerUser } from '../utils/api/auth.js';
import { getCart, addToCart } from '../utils/storage/cart.js';
import { formatCurrency } from '../utils/helpers/format.js';
import { Environment, Logger } from '../utils'; // ✨ NEW

// Import everything from a module
import * as AuthAPI from '../utils/api/auth.js';
import * as CartStorage from '../utils/storage/cart.js';
```

#### Backward Compatible Imports (Legacy)
```javascript
// Old patterns still work
import { 
  loginUser, 
  getCart, 
  formatCurrency, 
  validateEmail 
} from '../utils';
```

## 🔍 Configuration Validation ✨ NEW

The `ConfigChecker` automatically validates:
- ✅ Required environment variables
- ✅ API endpoint configuration
- ✅ Timeout and retry settings
- ✅ Development vs production settings
- ✅ Debug mode configuration

### Validation Messages
- **Development**: Shows detailed configuration info
- **Production**: Validates critical settings only
- **Startup**: Automatic validation on app load (development mode)

## 📈 Enhanced Logging ✨ NEW

### Smart Logging System
```javascript
import { Logger } from '../utils';

// Environment-aware logging
Logger.log('Debug info');     // Only in development + debug mode
Logger.warn('Warning');       // Always shown if logging enabled
Logger.error('Error');        // Always shown if logging enabled
```

### Logging Levels
- **Development**: Full logging with debug information
- **Production**: Error and warning logs only
- **Debug Mode**: Verbose logging for troubleshooting

### Environment Warnings
- Development API endpoints in production
- Debug mode enabled in production
- Missing required configuration
- Invalid timeout/retry settings

## 📊 Benefits

### Developer Experience
- **Better Organization**: Clear separation of concerns
- **Environment Awareness**: Smart behavior based on environment ✨ NEW
- **Configuration Validation**: Catch issues early ✨ NEW
- **Improved IntelliSense**: Better IDE support with modular imports
- **Easier Testing**: Smaller, focused modules are easier to test

### Performance
- **Tree Shaking**: Better bundling optimization
- **Lazy Loading**: Only import what you need
- **Smaller Bundles**: Reduced final bundle size
- **Environment Optimization**: Different behavior for dev/prod ✨ NEW

### Maintenance
- **Single Responsibility**: Each file has a clear purpose
- **Easy Updates**: Changes isolated to specific modules
- **Better Debugging**: Environment-aware logging ✨ NEW
- **Scalability**: Easy to add new utilities without bloating existing files

## 🔄 Migration Guide

### From Old Structure
```javascript
// OLD (still works)
import { formatCurrency } from '../utils/format-utils.js';
import { validateEmail } from '../utils/validation-utils.js';
import { login } from '../utils/auth-utils.js';

// NEW (recommended)  
import { formatCurrency, validateEmail, loginUser } from '../utils';
// OR
import { formatCurrency } from '../utils/helpers/format.js';
import { validateEmail } from '../utils/helpers/validation.js';
import { loginUser } from '../utils/api/auth.js';
```

## 🎯 Next Steps

1. **Monitor Configuration**: Check console for validation messages
2. **Update Environment**: Set production variables for deployment
3. **Enable Debug Mode**: For troubleshooting issues
4. **Review Logs**: Monitor API calls and errors

The utils directory now provides a robust, environment-aware foundation for your application! 🚀

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
