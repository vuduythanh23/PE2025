import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
  formatPrice, 
  isAuthenticated, 
  getUser,
  api 
} from '../utils';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { showNotification } = useNotification();
  
  // Get product from state (from Buy Now) or use cart items
  const productFromBuyNow = location.state?.product;
  const quantityFromBuyNow = location.state?.quantity || 1;
  
  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      showNotification('Vui lòng đăng nhập để tiếp tục thanh toán', 'error');
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }

    // Get user info and populate form
    const user = getUser();
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }

    // Set order items
    if (productFromBuyNow) {
      // From Buy Now button
      setOrderItems([{
        ...productFromBuyNow,
        quantity: quantityFromBuyNow
      }]);
      setTotalAmount(productFromBuyNow.price * quantityFromBuyNow);
    } else {
      // From cart - get cart items from localStorage or context
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cartItems.length === 0) {
        showNotification('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.', 'error');
        navigate('/products');
        return;
      }
      setOrderItems(cartItems);
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotalAmount(total);
    }
  }, [productFromBuyNow, quantityFromBuyNow, navigate, showNotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'address', 'city'];
    for (let field of required) {
      if (!customerInfo[field].trim()) {
        showNotification(`Vui lòng nhập ${field === 'name' ? 'họ tên' : 
          field === 'email' ? 'email' :
          field === 'phone' ? 'số điện thoại' :
          field === 'address' ? 'địa chỉ' : 'thành phố'}`, 'error');
        return false;
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      showNotification('Email không hợp lệ', 'error');
      return false;
    }
    
    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      showNotification('Số điện thoại không hợp lệ', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const orderData = {
        items: orderItems.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize || item.size,
          color: item.selectedColor || item.color
        })),
        customerInfo,
        paymentMethod,
        totalAmount,
        status: paymentMethod === 'cod' ? 'pending' : 'processing'
      };

      // Call API to create order
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        showNotification('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 'success');
        
        // Clear cart if this was from cart checkout
        if (!productFromBuyNow) {
          clearCart();
        }
        
        // Redirect to order confirmation or home
        navigate('/profile', { 
          state: { 
            orderSuccess: true, 
            orderId: response.data.orderId 
          } 
        });
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      showNotification(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-forest/10 to-luxury-light/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-luxury-dark mb-8">Thanh Toán</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-luxury p-6">
              <h2 className="text-xl font-semibold text-luxury-dark mb-6">Đơn Hàng</h2>
              
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-luxury-light/30 rounded-xl">
                    <img 
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-luxury-dark">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor && ` • Màu: ${item.selectedColor}`}
                      </p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-luxury-gold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng Cộng:</span>
                  <span className="text-luxury-gold">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information & Payment */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-luxury p-6">
                <h2 className="text-xl font-semibold text-luxury-dark mb-6">Thông Tin Khách Hàng</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ Tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      placeholder="Nhập email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Điện Thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành Phố *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      placeholder="Nhập thành phố"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa Chỉ *
                    </label>
                    <textarea
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã Bưu Điện
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={customerInfo.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      placeholder="Nhập mã bưu điện"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-luxury p-6">
                <h2 className="text-xl font-semibold text-luxury-dark mb-6">Phương Thức Thanh Toán</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-luxury-light/20 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-luxury-light/20 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banking"
                      checked={paymentMethod === 'banking'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Chuyển khoản trước khi giao hàng</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-luxury-gold to-luxury-gold/80 text-white font-semibold py-4 px-6 rounded-xl hover:from-luxury-gold/90 hover:to-luxury-gold/70 transform hover:scale-[1.02] transition-all duration-200 shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt Hàng'}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
