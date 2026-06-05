#!/bin/bash

# ETF Nexo - Database Setup Script
# Run this script to apply migrations to the remote Supabase database

set -e

echo "🗄️  ETF Nexo - Database Setup"
echo "================================"
echo ""

# Load environment variables
source .env.local

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found"
    echo "   Please install PostgreSQL client:"
    echo "   sudo apt-get install postgresql-client"
    exit 1
fi

echo "📡 Connecting to Supabase database..."
echo "   Host: db.utvioubcqkwwzvufhups.supabase.co"
echo "   Database: postgres"
echo ""

# Apply migration
echo "🚀 Applying initial schema migration..."
PGPASSWORD="$DATABASE_PASSWORD" psql \
  -h db.utvioubcqkwwzvufhups.supabase.co \
  -U postgres \
  -d postgres \
  -f supabase/migrations/20260603000001_create_initial_schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "📊 Verifying setup..."

    # Verify tables were created
    PGPASSWORD="$DATABASE_PASSWORD" psql \
      -h db.utvioubcqkwwzvufhups.supabase.co \
      -U postgres \
      -d postgres \
      -c "\dt" \
      -c "SELECT COUNT(*) as managers FROM fund_managers;" \
      -c "SELECT name FROM fund_managers LIMIT 3;"

    echo ""
    echo "🎉 Setup successful! You can now run: pnpm dev"
else
    echo ""
    echo "❌ Database setup failed"
    echo "   Check your network connection and database credentials"
    exit 1
fi
