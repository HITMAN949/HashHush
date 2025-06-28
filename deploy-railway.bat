@echo off
echo 🚀 Deploying HashHush to Railway...

railway --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Railway CLI...
    npm install -g @railway/cli
)

railway whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Railway...
    railway login
)

if not exist "railway.json" (
    echo 📋 Initializing Railway project...
    railway init
)

echo ⚙️ Setting environment variables...
railway variables set NODE_ENV=production

echo 🧹 Clearing build cache...
railway up --detach --force

echo 🚀 Deploying application using Docker...
railway up

echo 🌐 Getting deployment URL...
railway domain

echo ✅ Deployment complete! Your app should be live at the URL above.
echo 📊 You can monitor your deployment at: https://railway.app/dashboard
echo.
echo 🔧 If you encounter build issues, try:
echo    railway up --detach
echo    railway logs
echo.
echo 🐳 Using Docker build for reliable deployment
pause 