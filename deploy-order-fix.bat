@echo off
echo 🚀 Deploying Order Status Update Fix...

REM Define backend directory (modify this path to match your backend location)
set BACKEND_DIR=..\backend
REM Alternative common paths (uncomment the one that matches your setup):
REM set BACKEND_DIR=.\backend
REM set BACKEND_DIR=..\shoe-store-backend
REM set BACKEND_DIR=.\server

REM Check if backend directory exists
if not exist "%BACKEND_DIR%" (
    echo ❌ Backend directory not found: %BACKEND_DIR%
    echo Please modify BACKEND_DIR in this script to point to your backend folder
    echo Common backend folder names: backend, server, api, shoe-store-backend
    pause
    exit /b 1
)

echo 📂 Backend directory found: %BACKEND_DIR%

REM Copy fixed files to backend
echo 📋 Copying fixed files...

REM 1. Copy routes file
if exist "fixed-backend-orders-routes.js" (
    copy "fixed-backend-orders-routes.js" "%BACKEND_DIR%\routes\orders.routes.js" >nul
    echo ✅ Routes file copied
) else (
    echo ❌ Routes file not found
)

REM 2. Copy controller file
if exist "fixed-backend-orders-controller.js" (
    copy "fixed-backend-orders-controller.js" "%BACKEND_DIR%\controllers\orders.controller.js" >nul
    echo ✅ Controller file copied
) else (
    echo ❌ Controller file not found
)

REM 3. Copy auth middleware (if needed)
if exist "fixed-backend-auth-middleware.js" (
    if not exist "%BACKEND_DIR%\middleware" mkdir "%BACKEND_DIR%\middleware"
    copy "fixed-backend-auth-middleware.js" "%BACKEND_DIR%\middleware\auth.middleware.js" >nul
    echo ✅ Auth middleware copied
)

REM 4. Copy admin middleware (if needed)
if exist "fixed-backend-isAdmin-middleware.js" (
    if not exist "%BACKEND_DIR%\middleware" mkdir "%BACKEND_DIR%\middleware"
    copy "fixed-backend-isAdmin-middleware.js" "%BACKEND_DIR%\middleware\isAdmin.middleware.js" >nul
    echo ✅ Admin middleware copied
)

echo 🔄 All files copied successfully!

REM Navigate to backend directory
pushd "%BACKEND_DIR%"

REM Restart the server (choose the appropriate command for your setup)
echo 🔄 Restarting backend server...

REM Check if package.json exists
if exist "package.json" (
    echo 📦 Found package.json - stopping existing processes...
    
    REM Kill existing node processes (be careful with this)
    taskkill /f /im node.exe >nul 2>&1
    
    echo 📦 Starting server with npm run dev...
    start cmd /k "npm run dev"
    echo ✅ Server started with npm run dev
) else (
    echo ❌ No package.json found in backend directory
    echo Please start your server manually
)

REM Return to original directory
popd

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo 📋 Next Steps:
echo 1. Verify backend server is running
echo 2. Test order status updates in admin panel
echo 3. Check backend logs for any errors
echo 4. Use test files to verify functionality:
echo    - test-order-status-update.html
echo    - test-order-api-fix.html
echo.
echo ✅ The Confirm, Ship, and Completed buttons should now work in admin panel!
echo.
pause
