# Backend Orders API Implementation Guide

## 🚨 **Current Issue**
The frontend is trying to access order endpoints that don't exist on the backend yet:
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

## 🔧 **Required Backend Implementation**

### **1. Order Model/Schema**
```javascript
// MongoDB/Mongoose schema example
const orderSchema = {
  _id: ObjectId,
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    salePrice: Number,
    quantity: Number,
    selectedSize: String,
    selectedColor: String,
    imageUrl: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### **2. API Endpoints Implementation**

#### **POST /api/orders - Create Order**
```javascript
// Expected request body:
{
  "items": [
    {
      "productId": "product_id_here",
      "name": "Product Name",
      "price": 99.99,
      "salePrice": 79.99,
      "quantity": 2,
      "selectedSize": "42",
      "selectedColor": "Red",
      "imageUrl": "/images/product.jpg"
    }
  ],
  "totalAmount": 159.98,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "paymentMethod": "credit_card",
  "paymentStatus": "pending",
  "orderStatus": "pending"
}

// Expected response:
{
  "_id": "order_id_here",
  "user": "user_id_here",
  "items": [...],
  "totalAmount": 159.98,
  "orderStatus": "pending",
  "createdAt": "2025-06-11T08:00:00.000Z",
  "updatedAt": "2025-06-11T08:00:00.000Z"
}
```

#### **GET /api/orders - Get All Orders (Admin)**
```javascript
// Expected response:
[
  {
    "_id": "order_id",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "items": [...],
    "totalAmount": 159.98,
    "orderStatus": "pending",
    "createdAt": "2025-06-11T08:00:00.000Z"
  }
]
```

#### **GET /api/orders/my-orders - Get User Orders**
```javascript
// Expected response: same as above but filtered for current user
```

#### **GET /api/orders/:id - Get Single Order**
```javascript
// Expected response: single order object with full details
```

#### **PATCH /api/orders/:id - Update Order Status**
```javascript
// Expected request body:
{
  "status": "confirmed" // or "processing", "shipped", "delivered", "cancelled"
}

// Expected response: updated order object
```

#### **DELETE /api/orders/:id - Delete Order**
```javascript
// Expected response:
{
  "message": "Order deleted successfully"
}
```

### **3. Authentication & Authorization**
- All endpoints require valid JWT token
- Admin endpoints require admin role
- Users can only access their own orders

### **4. Error Handling**
```javascript
// Standard error responses:
{
  "error": "Error message here",
  "status": 400/401/403/404/500
}
```

## 🔄 **Current Frontend Implementation**

The frontend is already configured to work with these endpoints. Once you implement the backend:

1. **Order Creation**: Cart checkout will work
2. **User Orders**: Profile → My Orders will display orders
3. **Admin Management**: Admin panel will show all orders
4. **Status Updates**: Admin can update order status
5. **Notifications**: Users will receive real-time status updates

## 📝 **Backend Framework Examples**

### **Express.js + MongoDB**
```javascript
// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id
    });
    await order.save();
    await order.populate('user', 'email firstName lastName');
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        orderStatus: req.body.status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'email firstName lastName');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete order
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🚀 **Next Steps**

1. **Implement Backend**: Add the orders API endpoints to your backend
2. **Test Endpoints**: Use the test file at `test-orders-api.html` to verify
3. **Deploy**: Deploy the updated backend
4. **Frontend Ready**: Frontend will automatically work once backend is deployed

## 📋 **Testing**

Once implemented, test with:
```bash
# Test create order
curl -X POST https://your-backend.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"items": [...], "totalAmount": 100}'

# Test get orders
curl https://your-backend.com/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**The frontend is fully ready and waiting for the backend implementation!**
