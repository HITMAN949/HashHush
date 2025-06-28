@echo off
echo 🚀 Deploying HashHush to Railway...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Railway CLI...
    npm install -g @railway/cli
)

REM Check if user is logged in
railway whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Railway...
    railway login
)

REM Initialize Railway project if not already done
if not exist "railway.json" (
    echo 📋 Initializing Railway project...
    railway init
)

REM Set environment variables
echo ⚙️ Setting environment variables...
railway variables set NODE_ENV=production

REM Deploy to Railway
echo 🚀 Deploying application...
railway up

REM Get the deployment URL
echo 🌐 Getting deployment URL...
railway domain

echo ✅ Deployment complete! Your app should be live at the URL above.
echo 📊 You can monitor your deployment at: https://railway.app/dashboard
echo.
echo 🔧 If you encounter build issues, try:
echo    railway up --detach
echo    railway logs
pause 