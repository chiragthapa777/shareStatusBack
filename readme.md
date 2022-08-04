### shareStatus 

# .env start

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
