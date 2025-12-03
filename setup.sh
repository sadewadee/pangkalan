#!/bin/bash

echo "🏪 SETUP PANGKALAN LPG SYSTEM"
echo "================================"
echo ""

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
echo "⚙️ Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env .env.local
    echo "✅ Created .env.local file"
    echo "⚠️  Please edit .env.local with your Google Sheets credentials"
    echo ""
    echo "Next steps:"
    echo "1. Create Google Sheet: https://sheets.google.com"
    echo "2. Follow README instructions for Service Account setup"
    echo "3. Edit .env.local with your credentials"
    echo "4. Run: bun start"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🚀 Ready to run!"
echo "→ Edit .env.local with your Google Sheets credentials"
echo "→ Run: bun start"
echo "→ Open: http://localhost:3000"
echo "→ Login: admin / pangkalan123"
echo ""

echo "🎉 Setup completed!"
