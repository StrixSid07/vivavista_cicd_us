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
if [ ! -d vivavista_cicd_us ]; then
  echo "🌀 Cloning repository..."
  git clone https://github.com/StrixSid07/vivavista_cicd_us.git
fi

echo "📦 Pulling latest changes..."
cd vivavista_cicd_us
git fetch origin
git reset --hard origin/main

############### BACKEND ##################
echo "🚀 Setting up backend (vivavistausbackend)..."
cd vivavistausbackend
npm install

echo "🔁 Restarting backend with PM2..."
pm2 stop vivavista-backend-us || true
pm2 start server.js --name vivavista-backend-us --watch --time --log-date-format="YYYY-MM-DD HH:mm Z"
pm2 save
pm2 startup

############### ADMIN PANEL ##################
echo "🛠️ Building admin panel (vivavistausadmin)..."
cd ../vivavistausadmin
npm install
npm run build

echo "📤 Deploying admin panel to /var/www/vivavistausadmin..."
mkdir -p /var/www/vivavistausadmin
rm -rf /var/www/vivavistausadmin/*
cp -r dist/* /var/www/vivavistausadmin/

############### MAIN WEBSITE ##################
echo "🌐 Building main website (vivavistaus)..."
cd ../vivavistaus
npm install
npm run build

echo "📤 Deploying main website to /var/www/vivavistaus..."
mkdir -p /var/www/vivavistaus
rm -rf /var/www/vivavistaus/*
cp -r dist/* /var/www/vivavistaus/

echo "✅ Deployment completed successfully!"
EOF
