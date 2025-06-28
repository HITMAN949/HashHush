#!/bin/bash

echo "🚀 Deploying HashHush to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Initialize Railway project if not already done
if [ ! -f "railway.json" ]; then
    echo "📋 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production

# Deploy to Railway
echo "🚀 Deploying application..."
railway up

# Get the deployment URL
echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Deployment complete! Your app should be live at the URL above."
echo "📊 You can monitor your deployment at: https://railway.app/dashboard" 