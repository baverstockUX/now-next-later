#!/bin/bash

# Done-Now-Next-Explore Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Starting Done-Now-Next-Explore Setup..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"

# Check PostgreSQL
echo "🐘 Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "PostgreSQL found: $PSQL_VERSION"
else
    echo "⚠️  Warning: PostgreSQL not found. Please install PostgreSQL first."
    exit 1
fi

# Install backend dependencies
echo ""
echo "📥 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "📥 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your credentials before continuing!"
    echo ""
    read -p "Press Enter after you've configured .env file..."
else
    echo ""
    echo "✓ .env file already exists"
fi

# Ask to create database
echo ""
read -p "🗄️  Do you want to create the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name (default: roadmap_db): " DB_NAME
    DB_NAME=${DB_NAME:-roadmap_db}

    echo "Creating database '$DB_NAME'..."
    createdb $DB_NAME 2>/dev/null || echo "Database may already exist, continuing..."
    echo "✓ Database ready"
fi

# Run migrations
echo ""
read -p "🔧 Do you want to run database migrations now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running migrations..."
    node server/db/migrate.js
    echo "✓ Migrations completed"
fi

# Setup complete
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure .env is configured with your API keys"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:5173 in your browser"
echo "  4. Click 'Admin' and login to sync from AHA!"
echo ""
echo "📚 Documentation:"
echo "  - README.md: Complete documentation"
echo "  - SETUP_GUIDE.md: Quick setup guide"
echo "  - ARCHITECTURE.md: Technical architecture"
echo ""
echo "Happy roadmapping! 🎉"
