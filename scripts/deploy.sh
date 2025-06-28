#!/bin/bash

# Make sure: chmod +x deploy.sh
# Ensure these variables are set in your shell/session
# VPS_HOST, VPS_PORT, VPS_USERNAME

echo "🔗 Connecting to Hostinger VPS..."

ssh -p $VPS_PORT $VPS_USERNAME@$VPS_HOST << EOF
set -e  # Exit if any command fails

echo "✅ Logged into VPS: $VPS_USERNAME@$VPS_HOST"

echo "📁 Navigating to /var/www"
cd /var/www

# Clone if missing
if [ ! -d vivavista_cicd_ca ]; then
  echo "🌀 Cloning repository..."
  git clone https://github.com/StrixSid07/vivavista_cicd_ca.git
fi

echo "📦 Pulling latest changes..."
cd vivavista_cicd_ca
git fetch origin
git reset --hard origin/main

############### BACKEND ##################
echo "🚀 Setting up backend (vivavistacabackend)..."
cd vivavistacabackend
npm install

echo "🔁 Restarting backend with PM2..."
pm2 stop vivavista-backend-ca || true
pm2 start server.js --name vivavista-backend-ca --watch --time --log-date-format="YYYY-MM-DD HH:mm Z"
pm2 save
pm2 startup

############### ADMIN PANEL ##################
echo "🛠️ Building admin panel (vivavistacaadmin)..."
cd ../vivavistacaadmin
npm install
npm run build

echo "📤 Deploying admin panel to /var/www/vivavistacaadmin..."
mkdir -p /var/www/vivavistacaadmin
rm -rf /var/www/vivavistacaadmin/*
cp -r dist/* /var/www/vivavistacaadmin/

############### MAIN WEBSITE ##################
echo "🌐 Building main website (vivavistaca)..."
cd ../vivavistaca
npm install
npm run build

echo "📤 Deploying main website to /var/www/vivavistaca..."
mkdir -p /var/www/vivavistaca
rm -rf /var/www/vivavistaca/*
cp -r dist/* /var/www/vivavistaca/

echo "✅ Deployment completed successfully!"
EOF
