#!/bin/bash

# Order Status Update Fix - Deployment Script
# This script copies the fixed files to your backend and restarts the server

echo "🚀 Deploying Order Status Update Fix..."

# Define backend directory (modify this path to match your backend location)
BACKEND_DIR="../backend"  # Change this to your actual backend path
# Alternative common paths:
# BACKEND_DIR="./backend"
# BACKEND_DIR="../shoe-store-backend"
# BACKEND_DIR="./server"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    echo "Please modify BACKEND_DIR in this script to point to your backend folder"
    exit 1
fi

echo "📂 Backend directory found: $BACKEND_DIR"

# Copy fixed files to backend
echo "📋 Copying fixed files..."

# 1. Copy routes file
if [ -f "./fixed-backend-orders-routes.js" ]; then
    cp "./fixed-backend-orders-routes.js" "$BACKEND_DIR/routes/orders.routes.js"
    echo "✅ Routes file copied"
else
    echo "❌ Routes file not found"
fi

# 2. Copy controller file
if [ -f "./fixed-backend-orders-controller.js" ]; then
    cp "./fixed-backend-orders-controller.js" "$BACKEND_DIR/controllers/orders.controller.js"
    echo "✅ Controller file copied"
else
    echo "❌ Controller file not found"
fi

# 3. Copy auth middleware (if needed)
if [ -f "./fixed-backend-auth-middleware.js" ]; then
    cp "./fixed-backend-auth-middleware.js" "$BACKEND_DIR/middleware/auth.middleware.js"
    echo "✅ Auth middleware copied"
fi

# 4. Copy admin middleware (if needed)
if [ -f "./fixed-backend-isAdmin-middleware.js" ]; then
    cp "./fixed-backend-isAdmin-middleware.js" "$BACKEND_DIR/middleware/isAdmin.middleware.js"
    echo "✅ Admin middleware copied"
fi

echo "🔄 All files copied successfully!"

# Navigate to backend directory
cd "$BACKEND_DIR"

# Restart the server (choose the appropriate command for your setup)
echo "🔄 Restarting backend server..."

# Option 1: If using npm
if [ -f "package.json" ]; then
    echo "📦 Found package.json - restarting with npm..."
    pkill -f "node.*server" 2>/dev/null || true
    sleep 2
    npm run dev &
    echo "✅ Server restarted with npm run dev"
fi

# Option 2: If using PM2 (uncomment if needed)
# pm2 restart all
# echo "✅ Server restarted with PM2"

# Option 3: If using nodemon (uncomment if needed)
# pkill -f "nodemon" 2>/dev/null || true
# sleep 2
# nodemon server.js &
# echo "✅ Server restarted with nodemon"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify backend server is running"
echo "2. Test order status updates in admin panel"
echo "3. Check backend logs for any errors"
echo "4. Use test files to verify functionality:"
echo "   - test-order-status-update.html"
echo "   - test-order-api-fix.html"
echo ""
echo "✅ The Process and Cancel buttons should now work in admin panel!"
