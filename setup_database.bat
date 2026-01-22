@echo off
REM ============================================================
REM Database Setup Script for Central Club Membership System
REM ============================================================

echo.
echo ========================================
echo Central Club - Database Setup
echo ========================================
echo.

REM Database credentials
set PGHOST=197.140.16.200
set PGPORT=5432
set PGDATABASE=centralclubdb
set PGUSER=centralclub
set PGPASSWORD=central456club123

echo Connecting to database: %PGDATABASE%
echo Host: %PGHOST%:%PGPORT%
echo.

REM Step 1: Create membership table
echo [1/2] Creating membership table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f migrations/create_membership_table.sql

if %errorlevel% neq 0 (
    echo ERROR: Failed to create membership table
    pause
    exit /b 1
)

echo ✓ Membership table created successfully
echo.

REM Step 2: Insert test data
echo [2/2] Inserting test membership data...
echo WARNING: Make sure you've edited insert_test_memberships.sql with real user IDs!
echo.
pause

psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f migrations/insert_test_memberships.sql

if %errorlevel% neq 0 (
    echo ERROR: Failed to insert test data
    pause
    exit /b 1
)

echo ✓ Test data inserted successfully
echo.

REM Verify installation
echo Verifying installation...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "SELECT COUNT(*) as membership_count FROM membership;"

echo.
echo ========================================
echo Database setup complete! ✓
echo ========================================
echo.
pause
