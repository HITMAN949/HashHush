#!/bin/bash

echo "🔧 Setting up HashHush for Railway deployment..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "🏗️ Building React application..."
cd client
npm run build
cd ..

echo "✅ Build completed successfully!" 