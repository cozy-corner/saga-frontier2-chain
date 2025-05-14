#!/bin/bash
# Simple script to verify migrations in a CI/CD workflow

# Execute migrations
echo "Running migrations..."
cd "$(dirname "$0")" 
node migrate.js > migration_output.txt

# Extract migration status
echo "Checking migration status..."
if ! grep -q -- "--- MIGRATION_STATUS_BEGIN ---" migration_output.txt; then
  echo "ERROR: Failed to find migration status marker in output"
  cat migration_output.txt
  exit 1
fi

# Parse status from output
STATUS_LINE=$(grep -A1 -- "--- MIGRATION_STATUS_BEGIN ---" migration_output.txt | grep -v -- "--- MIGRATION_STATUS_BEGIN ---" | head -n1)
SUCCESS=$(echo "$STATUS_LINE" | grep -o '"success":[^,]*' | cut -d':' -f2)

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Migrations completed successfully"
  
  # Check if any migrations were actually applied
  MIGRATIONS=$(echo "$STATUS_LINE" | grep -o '"migrationsApplied":\[[^]]*\]' | cut -d':' -f2)
  if [ "$MIGRATIONS" = "[]" ]; then
    echo "ℹ️ No new migrations were applied"
  else
    echo "✅ Applied migrations: $MIGRATIONS"
  fi
  
  exit 0
else
  echo "❌ Migrations failed"
  # Print more detailed error information
  cat migration_output.txt
  exit 1
fi
