# Test Debug Endpoint
# Open in browser or REST client

## Get ALL memberships (requires authentication token)
GET http://192.168.1.44:3001/api/memberships/all
Authorization: Bearer YOUR_TOKEN_HERE

---

## Alternative: Direct database query via Node
Run this to check database directly:
```bash
node -e "
import('dotenv').then(dotenv => {
  dotenv.config();
  import('sequelize').then(({Sequelize}) => {
    const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST, 
      port: process.env.DB_PORT, 
      dialect: 'postgres'
    });
    seq.query('SELECT * FROM membership ORDER BY id').then(([rows]) => {
      console.table(rows);
      process.exit(0);
    });
  });
});
"
```

## Check specific user 521
GET http://192.168.1.44:3001/api/memberships/user/521/club/1  
Authorization: Bearer YOUR_TOKEN_HERE
