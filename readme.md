### shareStatus 

# .env start

# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB (Preview).
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://user:password@localhost:5432/DatabaseName?schema=public"

# Cloudinary config
CLOUD_NAME=****
CLOUD_API_KEY=****
CLOUD_API_SECRET=****

# .env end

# Prisma command
1. Run migration
   * npx prisma migrate dev
2. Seeding migration
   * npx prisma db seed
3. Generate and Run migration
   * npx prisma migrate dev --name _____
