#!/bin/sh
set -e

# Only generate passwords if credentials file doesn't exist (first run)
if [ ! -f /directus/data/.credentials_generated ]; then
    echo "🔐 First run detected - generating credentials..."
    
    # Generate random passwords
    export ADMIN_PASSWORD=${ADMIN_PASSWORD:-$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)}
    export DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)}
    export KEY=${KEY:-$(openssl rand -base64 64)}
    export SECRET=${SECRET:-$(openssl rand -base64 64)}
    
    # Save credentials
    cat > /directus/data/.credentials_generated <<EOF
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
SAVE THESE CREDENTIALS - THEY WON'T BE SHOWN AGAIN!
===========================================
EOF
    
    echo "✅ Credentials generated!"
    cat /directus/data/.credentials_generated
else
    echo "📋 Using existing credentials from previous run"
    cat /directus/data/.credentials_generated
fi

# Start Directus normally
exec node cli.js bootstrap && node cli.js start
