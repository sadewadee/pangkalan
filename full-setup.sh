#!/bin/bash

echo "🏪 PANGKALAN LPG - AUTOMATIC SETUP"
echo "====================================="

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "📦 Installing Bun.js..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo "✅ Bun.js installed!"
else
    echo "✅ Bun.js already installed"
fi

echo ""
echo "📦 Installing dependencies..."
bun install

echo ""
echo "⚙️ Setting up Google Sheets..."
bun setup-sheets.js

echo ""
echo "🚀 Starting server..."
echo "🌐 Application will run on: http://localhost:3000"
echo "👤 Login: admin"
echo "🔑 Password: pangkalan123"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

bun start
