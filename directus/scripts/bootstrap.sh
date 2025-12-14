#!/bin/sh
set -e

# Generate random passwords if not set
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-$(openssl rand -base64 32)}
export DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 32)}
export KEY=${KEY:-$(openssl rand -base64 64)}
export SECRET=${SECRET:-$(openssl rand -base64 64)}

# Save credentials to a file for reference
cat > /directus/credentials.txt <<EOF
===========================================
DIRECTUS ADMIN CREDENTIALS
===========================================
Admin Email: ${ADMIN_EMAIL}
Admin Password: ${ADMIN_PASSWORD}

Database User: ${DB_USER}
Database Password: ${DB_PASSWORD}

Directus Key: ${KEY}
Directus Secret: ${SECRET}
===========================================
IMPORTANT: Save these credentials securely!
===========================================
EOF

echo "✅ Credentials generated and saved to /directus/credentials.txt"
cat /directus/credentials.txt

# Start Directus
exec node cli.js bootstrap && node cli.js start
