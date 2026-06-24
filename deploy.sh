#!/bin/bash
echo "Pulling latest changes from GitHub..."
git pull origin main

echo "Installing dependencies..."
cd build-your-own-package
npm install

echo "Building the application..."
npm run build

echo "Deployment finished successfully!"
