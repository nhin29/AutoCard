#!/bin/bash

# Script to push SQL migrations to Supabase
# Usage: ./scripts/push-sql.sh [migration-file.sql]
# Or: ./scripts/push-sql.sh (pushes all pending migrations)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project details
PROJECT_REF="vqfsgmwwodyzcgtxesaw"
DB_HOST="aws-0-eu-central-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.vqfsgmwwodyzcgtxesaw"

echo -e "${GREEN}Supabase SQL Push Script${NC}"
echo "================================"

# Check if DB_PASSWORD is set
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${YELLOW}DB_PASSWORD environment variable is not set.${NC}"
  echo "Please set it:"
  echo "  export DB_PASSWORD='your-database-password'"
  echo ""
  read -sp "Enter your database password: " DB_PASSWORD
  echo ""
fi

# Build connection string
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Check if specific file was provided
if [ -n "$1" ]; then
  SQL_FILE="$1"
  
  if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: File not found: $SQL_FILE${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Pushing SQL file: $SQL_FILE${NC}"
  npx supabase db execute --db-url "$CONNECTION_STRING" --file "$SQL_FILE"
else
  echo -e "${GREEN}Pushing all pending migrations...${NC}"
  npx supabase db push --db-url "$CONNECTION_STRING"
fi

echo -e "${GREEN}✓ Done!${NC}"