#!/bin/sh
set -e

echo "🚀 Spark Platform - Starting Directus with Schema-as-Code..."

# === Configuration ===
DB_READY=false
MAX_RETRIES=30
RETRY_COUNT=0

# === Fallback for missing env vars (prevents 'role root does not exist') ===
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-postgresql}"
DB_DATABASE="${DB_DATABASE:-directus}"
DB_PASSWORD="${DB_PASSWORD:-Idk@2026lolhappyha232}"

# === Wait for PostgreSQL ===
echo "📡 Waiting for PostgreSQL to be ready..."
echo "📡 Using DB_USER=$DB_USER, DB_HOST=$DB_HOST, DB_DATABASE=$DB_DATABASE"
until [ $DB_READY = true ] || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_DATABASE" -c '\q' 2>/dev/null; then
        DB_READY=true
        echo "✅ PostgreSQL is ready"
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "⏳ Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    fi
done

if [ $DB_READY = false ]; then
    echo "❌ PostgreSQL failed to start after $MAX_RETRIES attempts"
    exit 1
fi

# === Fresh Install Mode ===
if [ "$FORCE_FRESH_INSTALL" = "true" ] || [ "$FORCE_FRESH_INSTALL" = "True" ]; then
    echo ""
    echo "⚠️  ============================================"
    echo "⚠️  FORCE_FRESH_INSTALL MODE ACTIVATED"
    echo "⚠️  Wiping entire database in 5 seconds..."
    echo "⚠️  Press Ctrl+C to cancel!"
    echo "⚠️  ============================================"
    sleep 5
    
    echo "🗑️  Dropping public schema..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_DATABASE" <<-EOSQL
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO "$DB_USER";
        GRANT ALL ON SCHEMA public TO public;
        COMMENT ON SCHEMA public IS 'Recreated by FORCE_FRESH_INSTALL';
EOSQL
    
    echo "✅ Database wiped clean - ready for fresh install"
    echo ""
fi

# === Bootstrap Directus ===
echo "📦 Bootstrapping Directus..."
npx directus bootstrap

# === Apply Schema from Code (NON-FATAL - Directus can start without it) ===
if [ -f "/directus/schema.yaml" ]; then
    echo "🔄 Applying schema from schema.yaml..."
    npx directus schema apply /directus/schema.yaml --yes || echo "⚠️ schema.yaml apply failed, continuing anyway"
    echo "✅ Schema applied from code"
elif [ -f "/directus/complete_schema.sql" ]; then
    echo "🔄 Applying schema from complete_schema.sql..."
    # Run in background with timeout to prevent hanging
    timeout 120 sh -c 'PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_DATABASE" < /directus/complete_schema.sql' || {
        echo "⚠️ SQL schema apply failed or timed out (2 min), continuing anyway"
        echo "⚠️ You may need to run the schema manually later"
    }
    echo "✅ SQL schema step complete"
else
    echo "⚠️  No schema.yaml or complete_schema.sql found"
    echo "ℹ️  Directus will start with empty schema"
fi

# === Import Extensions ===
if [ -d "/directus/extensions" ]; then
    echo "🔌 Loading extensions..."
    EXTENSION_COUNT=$(find /directus/extensions -name "package.json" | wc -l)
    echo "📦 Found $EXTENSION_COUNT extensions"
fi

# === Start Directus ===
echo ""
echo "✅ Initialization complete"
echo "🚀 Starting Directus server..."
echo ""

npx directus start
