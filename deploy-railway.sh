#!/bin/bash

echo "🚀 Deploying HashHush to Railway..."

if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

if [ ! -f "railway.json" ]; then
    echo "📋 Initializing Railway project..."
    railway init
fi

echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production

echo "🚀 Deploying application using Docker..."
railway up

echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Deployment complete! Your app should be live at the URL above."
echo "📊 You can monitor your deployment at: https://railway.app/dashboard"
echo ""
echo "🔧 If you encounter build issues, try:"
echo "   railway up --detach"
echo "   railway logs"
echo ""
echo "🐳 Using Docker build for reliable deployment" 