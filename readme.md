# shareStatus
share status is a social media application. Technology used in this project are Express backend api server, Socket.io , ReactJS, Redux, PostgresSQL, Prisma, JWT, Cloudinary etc.
### feature
1. User Account  :  login and register, extensive account settings, follow and unfollow.
2. Post : CRUD, search, extensive filter, like , share and comment.
3. Schedule post upload.
4. Focus mode.
5. Realtime chatting.


# .env start

DATABASE_URL="postgresql://user:password@localhost:5432/DatabaseName?schema=public"

# Cloudinary config
CLOUD_NAME=****
CLOUD_API_KEY=****
CLOUD_API_SECRET=****

SECRET_KEY=***

# .env end

# Prisma command
1. Run migration
   * npx prisma migrate dev
2. Seeding migration
   * npx prisma db seed
3. Generate and Run migration
   * npx prisma migrate dev --name _____

# Start development server
   * npm run dev
