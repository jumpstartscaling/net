# Spark Platform - Troubleshooting & SSH Access

## Server Access

### SSH Connection
```bash
ssh root@72.61.15.216
# Password required (obtain from server admin)
```

### Coolify API Access
```bash
# API Token
COOLIFY_TOKEN="4|tqkE6hP6cnYzJtFF4XxIYQ3LXDUyd1gnUKq7sCnv66b39b0d"

# Application UUID
APP_UUID="i8cswkos04c4s08404ok0ws4"

# Get application info
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "http://72.61.15.216:8000/api/v1/applications/$APP_UUID"

# Get logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "http://72.61.15.216:8000/api/v1/applications/$APP_UUID/logs"

# Trigger deployment
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -X POST "http://72.61.15.216:8000/api/v1/deploy?uuid=$APP_UUID"
```

---

## Docker Commands (via SSH)

### View Running Containers
```bash
docker ps
docker ps | grep -E 'directus|frontend|postgresql'
```

### View Container Logs
```bash
# Frontend logs
docker logs <frontend-container-id> --tail 100

# Directus logs
docker logs <directus-container-id> --tail 100

# Follow logs in real-time
docker logs -f <container-id>
```

### Check Container Status
```bash
# Inspect container
docker inspect <container-id>

# Check health
docker inspect <container-id> | grep -A 10 Health
```

### Restart Services
```bash
# Restart specific service
docker restart <container-id>

# Restart all services
docker restart $(docker ps -q)
```

---

## Troubleshooting Failed Deployments

### Check Deployment Logs in Coolify
1. Go to http://72.61.15.216:8000
2. Navigate to Application → Deployments
3. Click failed deployment
4. View "Logs" tab
5. Look for error messages at the bottom

### Common Issues

#### CORS Errors
**Symptom:** Frontend loads but Intelligence pages show "Failed to fetch"

**Fix:**
1. Check docker-compose.yaml has CORS vars
2. Verify Directus container has environment variables
3. Restart Directus service

```bash
# Check Directus environment
docker exec <directus-container> env | grep CORS

# Should see:
# CORS_ENABLED=true
# CORS_ORIGIN=https://launch.jumpstartscaling.com
```

#### Port Conflicts
**Symptom:** Deployment fails with "port already allocated"

**Fix:**
```bash
# Find what's using the port
lsof -i :4321
lsof -i :8055

# Kill process or change port in config
```

#### Build Failures
**Symptom:** Deployment fails during build step

**Common causes:**
- Missing dependencies
- TypeScript errors
- Out of memory

**Fix:**
```bash
# Check Docker build logs
docker logs <coolify-builder-container>

# Increase Docker memory limit if needed
```

#### Database Connection Issues
**Symptom:** Directus can't connect to PostgreSQL

**Fix:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check Directus can reach it
docker exec <directus-container> ping postgresql

# Verify credentials in environment
docker exec <directus-container> env | grep DB_
```

---

## Service URLs

### Production
- **Frontend (Launch):** https://launch.jumpstartscaling.com
- **Directus (Spark):** https://spark.jumpstartscaling.com
- **Coolify:** http://72.61.15.216:8000

### Health Checks
```bash
# Frontend health
curl -I https://launch.jumpstartscaling.com

# Directus health  
curl -I https://spark.jumpstartscaling.com/admin/login

# Check if services respond
curl -I https://launch.jumpstartscaling.com/admin
curl -I https://spark.jumpstartscaling.com/items/sites
```

---

## Quick Diagnostics

### Full System Check
```bash
#!/bin/bash
echo "=== Docker Containers ==="
docker ps

echo -e "\n=== Frontend Status ==="
curl -sI https://launch.jumpstartscaling.com | head -5

echo -e "\n=== Directus Status ==="
curl -sI https://spark.jumpstartscaling.com | head -5

echo -e "\n=== Database Status ==="
docker exec <postgres-container> pg_isready

echo -e "\n=== Recent Logs ==="
docker logs <frontend-container> --tail 20
docker logs <directus-container> --tail 20
```

### Check Environment Variables
```bash
# Directus environment
docker exec <directus-container> env | grep -E "CORS|DB_|ADMIN"

# Frontend environment  
docker exec <frontend-container> env | grep -E "DIRECTUS|PUBLIC"
```

---

## Deployment Workflow

### Manual Deployment via Coolify
1. Commit changes to Git
2. Push to GitHub main branch
3. Coolify webhook triggers or manual deploy
4. Coolify pulls latest code
5. Runs docker-compose build
6. Starts new containers
7. Routes traffic via Traefik

### Verify Deployment
```bash
# Check latest commit deployed
curl https://launch.jumpstartscaling.com | grep -o 'version.*' | head -1

# Check build time
docker inspect <container> | grep Created
```

---

## Emergency Procedures

### Rollback Deployment
1. In Coolify, find previous successful deployment
2. Click "Redeploy" on that deployment
3. Wait for build to complete

### Force Rebuild
```bash
# SSH into server
ssh root@72.61.15.216

# Force remove containers
docker-compose down

# Rebuild from scratch
docker-compose up -d --build

# Or via Coolify:
# Click "Redeploy" with "Force Rebuild" option
```

### Database Backup
```bash
# Backup PostgreSQL
docker exec <postgres-container> pg_dump -U directus directus > backup.sql

# Restore
docker exec -i <postgres-container> psql -U directus directus < backup.sql
```

---

## Monitoring

### Real-Time Logs
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f frontend
docker-compose logs -f directus
```

### Resource Usage
```bash
# Container resources
docker stats

# Disk space
df -h
docker system df
```

---

## Contact & Access

**Server:** 72. 61.15.216  
**Coolify Web:** http://72.61.15.216:8000  
**SSH User:** root  
**Coolify Token:** 4|tqkE6hP6cnYzJtFF4XxIYQ3LXDUyd1gnUKq7sCnv66b39b0d  
**App UUID:** i8cswkos04c4s08404ok0ws4
