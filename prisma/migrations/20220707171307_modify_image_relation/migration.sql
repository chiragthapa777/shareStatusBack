/*
  Warnings:

  - You are about to drop the column `postId` on the `postImage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `userImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imageId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "postImage" DROP CONSTRAINT "postImage_postId_fkey";

-- DropForeignKey
ALTER TABLE "userImage" DROP CONSTRAINT "userImage_userId_fkey";

-- DropIndex
DROP INDEX "postImage_postId_key";

-- DropIndex
DROP INDEX "userImage_userId_key";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "postImage" DROP COLUMN "postId";

-- AlterTable
ALTER TABLE "userImage" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Post_imageId_key" ON "Post"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "userImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "postImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
