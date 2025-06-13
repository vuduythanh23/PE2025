@echo off
echo =========================================
echo BACKEND ORDERS CONTROLLER DEPLOYMENT
echo =========================================
echo.

REM Check if backend directory exists
if not exist "%BACKEND_DIR%" (
    echo ERROR: Backend directory not found at %BACKEND_DIR%
    echo Please set BACKEND_DIR environment variable to your backend project path
    echo Example: set BACKEND_DIR=C:\path\to\your\backend
    echo.
    pause
    exit /b 1
)

echo 📁 Backend directory: %BACKEND_DIR%
echo.

echo 🔄 Backing up original controller...
if exist "%BACKEND_DIR%\controllers\orders.controller.js" (
    copy "%BACKEND_DIR%\controllers\orders.controller.js" "%BACKEND_DIR%\controllers\orders.controller.js.backup" >nul
    echo ✅ Original controller backed up as orders.controller.js.backup
) else (
    echo ⚠️  Original controller not found, proceeding with deployment...
)

echo.
echo 🚀 Deploying fixed orders controller...
copy "fixed-backend-orders-controller.js" "%BACKEND_DIR%\controllers\orders.controller.js" >nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Fixed orders controller deployed successfully!
) else (
    echo ❌ Failed to deploy controller
    pause
    exit /b 1
)

echo.
echo 🔄 Restarting backend server...
echo.

cd /d "%BACKEND_DIR%"

REM Try different restart methods
echo Attempting to restart server...

REM Method 1: pm2
pm2 restart all >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Server restarted using pm2
    goto :success
)

REM Method 2: npm restart
npm run restart >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Server restarted using npm restart
    goto :success
)

REM Method 3: Manual instruction
echo ⚠️  Automatic restart failed
echo Please restart your backend server manually:
echo   - If using npm: npm run dev
echo   - If using pm2: pm2 restart your-app-name
echo   - If using nodemon: It should auto-restart

:success
echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo 📋 CHANGES APPLIED:
echo   ✅ Backend auto-updates payment status to "paid" when order confirmed
echo   ✅ Supports "paid" payment status in validation
echo   ✅ All controllers populate full user data
echo   ✅ Compatible with frontend payment status logic
echo.
echo 🧪 TESTING:
echo   1. Admin confirms order → Payment should auto-update to "paid"
echo   2. Reload page → Payment status should persist as "paid"
echo   3. Check customer info → Username and email should display
echo.

pause
