#!/bin/bash

# Path to the main entry file
MAIN_FILE="./dist/src/main.js"

# Check if the main file exists
if [ ! -f "$MAIN_FILE" ]; then
    echo "Error: $MAIN_FILE not found. Build might have failed. Going to retry..."
    cd backend
    nvm use default
    npm i
    npm run build:swc
fi

if [ ! -f "$MAIN_FILE" ]; then
  echo "Error: $MAIN_FILE not found. Build might have failed. Exiting..."
  exit 1
fi

# Allow the application to use more memory
export NODE_OPTIONS="--max-old-space-size=2048"

# Start the application with PM2
pm2 startOrRestart ecosystem.config.js --update-env
