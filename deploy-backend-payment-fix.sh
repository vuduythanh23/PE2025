#!/bin/bash

echo "========================================="
echo "BACKEND ORDERS CONTROLLER DEPLOYMENT"
echo "========================================="
echo

# Check if BACKEND_DIR is set
if [ -z "$BACKEND_DIR" ]; then
    echo "ERROR: BACKEND_DIR environment variable not set"
    echo "Please set it to your backend project path:"
    echo "export BACKEND_DIR=/path/to/your/backend"
    echo
    exit 1
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: Backend directory not found at $BACKEND_DIR"
    echo "Please verify the path is correct"
    echo
    exit 1
fi

echo "📁 Backend directory: $BACKEND_DIR"
echo

echo "🔄 Backing up original controller..."
if [ -f "$BACKEND_DIR/controllers/orders.controller.js" ]; then
    cp "$BACKEND_DIR/controllers/orders.controller.js" "$BACKEND_DIR/controllers/orders.controller.js.backup"
    echo "✅ Original controller backed up as orders.controller.js.backup"
else
    echo "⚠️  Original controller not found, proceeding with deployment..."
fi

echo
echo "🚀 Deploying fixed orders controller..."
cp "fixed-backend-orders-controller.js" "$BACKEND_DIR/controllers/orders.controller.js"

if [ $? -eq 0 ]; then
    echo "✅ Fixed orders controller deployed successfully!"
else
    echo "❌ Failed to deploy controller"
    exit 1
fi

echo
echo "🔄 Restarting backend server..."
echo

cd "$BACKEND_DIR"

# Try different restart methods
echo "Attempting to restart server..."

# Method 1: pm2
if command -v pm2 >/dev/null 2>&1; then
    pm2 restart all >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Server restarted using pm2"
        exit 0
    fi
fi

# Method 2: npm restart
npm run restart >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Server restarted using npm restart"
    exit 0
fi

# Method 3: Manual instruction
echo "⚠️  Automatic restart failed"
echo "Please restart your backend server manually:"
echo "  - If using npm: npm run dev"
echo "  - If using pm2: pm2 restart your-app-name"
echo "  - If using nodemon: It should auto-restart"

echo
echo "🎉 DEPLOYMENT COMPLETE!"
echo
echo "📋 CHANGES APPLIED:"
echo "  ✅ Backend auto-updates payment status to \"paid\" when order confirmed"
echo "  ✅ Supports \"paid\" payment status in validation"
echo "  ✅ All controllers populate full user data"
echo "  ✅ Compatible with frontend payment status logic"
echo
echo "🧪 TESTING:"
echo "  1. Admin confirms order → Payment should auto-update to \"paid\""
echo "  2. Reload page → Payment status should persist as \"paid\""
echo "  3. Check customer info → Username and email should display"
echo
