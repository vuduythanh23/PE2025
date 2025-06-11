import { useState, useEffect } from "react";

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate checking for order updates
    // In a real app, this would be WebSocket or polling
    const checkForUpdates = () => {
      const lastCheck = localStorage.getItem('lastOrderCheck');
      const now = new Date().getTime();
      
      // Check every 30 seconds for demo purposes
      if (!lastCheck || now - parseInt(lastCheck) > 30000) {
        localStorage.setItem('lastOrderCheck', now.toString());
        
        // Simulate random notification (for demo)
        if (Math.random() > 0.8) {
          const messages = [
            'Your order #12345 has been confirmed!',
            'Your order #67890 has been shipped!',
            'Your order #54321 has been delivered!'
          ];
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          
          setNotifications(prev => [...prev, {
            id: Date.now(),
            message: randomMessage,
            type: 'success'
          }]);
        }
      }
    };

    const interval = setInterval(checkForUpdates, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-blue-100 border border-blue-300 text-blue-800'
          } animate-slide-in`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
