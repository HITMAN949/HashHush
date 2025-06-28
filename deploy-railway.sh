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

echo "🧹 Clearing build cache and forcing Docker build..."
railway up --detach --force

echo "🚀 Deploying application using Docker..."
railway up

echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Deployment complete! Your app should be live at the URL above."
echo "📊 You can monitor your deployment at: https://railway.app/dashboard"
echo ""
echo "🔧 If you still encounter Nixpacks issues, try:"
echo "   railway service delete"
echo "   railway init"
echo "   railway up"
echo ""
echo "🐳 Using Docker build for reliable deployment" 