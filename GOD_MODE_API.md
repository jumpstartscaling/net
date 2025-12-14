# God Mode API - Documentation

## 🔐 Overview

The God Mode API provides unrestricted access to the Spark Platform's database and Directus system. It bypasses all authentication and permission checks.

**Security:** Access requires `X-God-Token` header with secret token.

---

## 🔑 Your Secure Token

```
GOD_MODE_TOKEN=jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA
```

**⚠️ CRITICAL:**
- This token is for YOU and your AI assistant ONLY
- NEVER commit to git (already in `.gitignore`)
- NEVER share publicly
- Store in Coolify environment variables

---

## 🚀 Setup in Coolify

1. Go to Coolify → Your Spark Project
2. Click "Directus" service
3. Go to "Environment Variables"
4. Click "Add Variable":
   - **Name:** `GOD_MODE_TOKEN`
   - **Value:** `jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA`
5. Save and redeploy

---

## 📡 API Endpoints

### Base URL
```
https://spark.jumpstartscaling.com/god
```

All endpoints require header:
```
X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA
```

---

### 1. Check God Mode Status

```bash
curl -X GET https://spark.jumpstartscaling.com/god/status \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA"
```

**Response:**
```json
{
  "success": true,
  "god_mode": true,
  "database": {
    "tables": 39,
    "collections": 39,
    "permissions": 156
  },
  "timestamp": "2025-12-14T11:05:00.000Z"
}
```

---

### 2. Initialize Database

```bash
# Read SQL file
SQL_CONTENT=$(cat complete_schema.sql)

# Execute
curl -X POST https://spark.jumpstartscaling.com/god/setup/database \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $(jq -Rs . < complete_schema.sql)}"
```

**Response:**
```json
{
  "success": true,
  "tables_created": 39,
  "tables": [
    "sites",
    "pages",
    "posts",
    "avatar_intelligence",
    ...
  ]
}
```

---

### 3. Grant All Permissions

```bash
curl -X POST https://spark.jumpstartscaling.com/god/permissions/grant-all \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA"
```

**Response:**
```json
{
  "success": true,
  "permissions_granted": 156,
  "collections": 39
}
```

---

### 4. Execute Raw SQL

```bash
curl -X POST https://spark.jumpstartscaling.com/god/sql/execute \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM sites ORDER BY date_created DESC LIMIT 5;"
  }'
```

**Response:**
```json
{
  "success": true,
  "rows": [
    {
      "id": "abc123",
      "name": "My Site",
      "domain": "example.com"
    }
  ],
  "rowCount": 1
}
```

---

### 5. Get All Collections (Including System)

```bash
curl -X GET https://spark.jumpstartscaling.com/god/collections/all \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA"
```

**Response:**
```json
{
  "success": true,
  "count": 75,
  "data": [
    {
      "collection": "directus_users",
      "icon": "people",
      ...
    },
    {
      "collection": "sites",
      "icon": "dns",
      ...
    }
  ]
}
```

---

### 6. Make User Admin

```bash
curl -X POST https://spark.jumpstartscaling.com/god/user/make-admin \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "role": "admin-role-id"
  }
}
```

---

## 🛡️ Auto-Permissions Hook

The platform includes an auto-permissions hook that runs on Directus startup:

**What it does:**
- Automatically grants all permissions to Administrator policy
- Runs after Directus initialization
- Checks for existing permissions first
- Creates 4 permissions per collection (create, read, update, delete)

**No manual action needed!**

---

## 🎯 Use Cases

### Fresh Deployment Setup
```bash
# 1. Check status
curl -X GET .../god/status -H "X-God-Token: ..."

# 2. Initialize database
curl -X POST .../god/setup/database -H "X-God-Token: ..." -d @schema.json

# 3. Grant permissions
curl -X POST .../god/permissions/grant-all -H "X-God-Token: ..."

# Done! ✅
```

### Fix Permission Issues
```bash
curl -X POST .../god/permissions/grant-all -H "X-God-Token: ..."
```

### Query Database Directly
```bash
curl -X POST .../god/sql/execute \
  -H "X-God-Token: ..." \
  -d '{"sql": "SELECT COUNT(*) FROM generated_articles WHERE status = '\''published'\'';"}''
```

---

## ⚠️ Security Notes

### What God Mode Can Do:
- ✅ Execute any SQL query
- ✅ Modify any Directus collection
- ✅ Grant/revoke permissions
- ✅ Access system collections
- ✅ Bypass all authentication
- ✅ Create/delete tables

### Security Measures:
- ✅ 128-character random token
- ✅ Token not in git repository
- ✅ Only in Coolify environment variables
- ✅ Logs all access attempts
- ✅ Requires exact token match

### If Token is Compromised:
1. Generate new token:
   ```bash
   node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(64).toString('base64url'));"
   ```
2. Update in Coolify environment variables
3. Redeploy Directus service

---

## 📝 File Structure

```
directus-extensions/
├── endpoints/
│   └── god/
│       ├── index.js        # God Mode API implementation
│       └── package.json    # Extension metadata
└── hooks/
    └── auto-permissions/
        ├── index.js        # Auto-grant permissions on startup
        └── package.json    # Hook metadata
```

---

## ✅ Verification

After deployment:

```bash
# Test god mode access
curl -X GET https://spark.jumpstartscaling.com/god/status \
  -H "X-God-Token: jmQXoeyxWoBsB7eHzG7FmnH90f22JtaYBxXHoorhfZ-v4tT3VNEr9vvmwHqYHCDoWXHSU4DeZXApCP-Gha-YdA"

# Should return success: true
```

---

**God Mode is your backdoor into everything. Use responsibly!** 🔥
