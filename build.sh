#!/bin/bash

echo "🔧 Setting up HashHush for Railway deployment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Build the React app
echo "🏗️ Building React application..."
cd client
npm run build
cd ..

echo "✅ Build completed successfully!" 