# Quick Database Setup Commands
# Use these if you prefer manual control over the automated scripts

## Connection String
```
Host: 197.140.16.200
Port: 5432
Database: centralclubdb
User: centralclub
Password: central456club123
```

## Manual Commands

### 1. Create Membership Table
```bash
psql -h 197.140.16.200 -p 5432 -U centralclub -d centralclubdb -f migrations/create_membership_table.sql
```

### 2. Insert Test Data (Edit file first!)
```bash
psql -h 197.140.16.200 -p 5432 -U centralclub -d centralclubdb -f migrations/insert_test_memberships.sql
```

### 3. Verify Installation
```bash
psql -h 197.140.16.200 -p 5432 -U centralclub -d centralclubdb -c "SELECT * FROM membership;"
```

### 4. Check User IDs (to update test script)
```bash
psql -h 197.140.16.200 -p 5432 -U centralclub -d centralclubdb -c "SELECT id, nom, prenom, email FROM utilisateur LIMIT 10;"
```

## Automated Setup (Recommended)

### Windows:
```bash
cd e:\backend\backend
setup_database.bat
```

### Linux/Mac:
```bash
cd /path/to/backend
chmod +x setup_database.sh
./setup_database.sh
```

## After Setup

1. Restart backend server
2. Test API: `GET http://192.168.1.20:3001/api/memberships/user/521/club/1`
3. Hot restart Flutter app
4. Check Profile page for membership display

## Troubleshooting

**Connection timeout:**
- Check if PostgreSQL server is accessible from your IP
- Verify firewall allows port 5432

**Authentication failed:**
- Double-check username/password
- Verify user has permissions

**Table already exists:**
- Drop old table: `DROP TABLE IF EXISTS membership CASCADE;`
- Then re-run create script
