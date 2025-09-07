#!/bin/bash

# Deployment script for DigitalOcean LaTeX service
# Run this on your DigitalOcean server

echo "🚀 Deploying optimized LaTeX service..."

# Stop the current service
echo "📴 Stopping current service..."
pkill -f "node.*server.js" || true
sleep 2

# Backup current files
echo "💾 Backing up current files..."
if [ -f "/opt/latex-service/api/server.js" ]; then
    cp /opt/latex-service/api/server.js /opt/latex-service/api/server.js.backup
fi

if [ -f "/opt/latex-service/run-latex.sh" ]; then
    cp /opt/latex-service/run-latex.sh /opt/latex-service/run-latex.sh.backup
fi

# Update server.js
echo "📝 Updating server.js..."
cp optimized-server.js /opt/latex-service/api/server.js

# Update run-latex.sh
echo "📝 Updating run-latex.sh..."
cp run-latex.sh /opt/latex-service/run-latex.sh
chmod +x /opt/latex-service/run-latex.sh

# Install timeout command if not available
if ! command -v timeout &> /dev/null; then
    echo "⏰ Installing timeout command..."
    apt update && apt install -y coreutils
fi

# Install xxd if not available (for hex validation)
if ! command -v xxd &> /dev/null; then
    echo "🔍 Installing xxd..."
    apt update && apt install -y vim-common
fi

# Start the service
echo "▶️ Starting optimized service..."
cd /opt/latex-service/api
nohup node server.js > server.log 2>&1 &

# Wait a moment for service to start
sleep 3

# Check if service is running
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Service started successfully!"
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed!"
    fi
    
    # Show service status
    echo "📊 Service status:"
    ps aux | grep "node.*server.js" | grep -v grep
    
    echo "📋 Logs are being written to: /opt/latex-service/api/server.log"
    echo "🔍 Monitor logs with: tail -f /opt/latex-service/api/server.log"
    
else
    echo "❌ Failed to start service!"
    echo "📋 Check logs: tail -f /opt/latex-service/api/server.log"
    exit 1
fi

echo "🎉 Deployment complete!" 