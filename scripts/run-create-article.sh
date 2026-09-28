#!/bin/bash
# Load environment variables
set -a
source .env.local
set +a

# Run script
npx tsx scripts/create-academia-article-que-son-etfs.ts
