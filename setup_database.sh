#!/bin/bash
# ============================================================
# Database Setup Script for Central Club Membership System
# ============================================================

echo ""
echo "========================================"
echo "Central Club - Database Setup"
echo "========================================"
echo ""

# Database credentials
export PGHOST=197.140.16.200
export PGPORT=5432
export PGDATABASE=centralclubdb
export PGUSER=centralclub
export PGPASSWORD=central456club123

echo "Connecting to database: $PGDATABASE"
echo "Host: $PGHOST:$PGPORT"
echo ""

# Step 1: Create membership table
echo "[1/2] Creating membership table..."
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f migrations/create_membership_table.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create membership table"
    exit 1
fi

echo "✓ Membership table created successfully"
echo ""

# Step 2: Insert test data
echo "[2/2] Inserting test membership data..."
echo "WARNING: Make sure you've edited insert_test_memberships.sql with real user IDs!"
echo ""
read -p "Press Enter to continue..."

psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f migrations/insert_test_memberships.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to insert test data"
    exit 1
fi

echo "✓ Test data inserted successfully"
echo ""

# Verify installation
echo "Verifying installation..."
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) as membership_count FROM membership;"

echo ""
echo "========================================"
echo "Database setup complete! ✓"
echo "========================================"
echo ""
