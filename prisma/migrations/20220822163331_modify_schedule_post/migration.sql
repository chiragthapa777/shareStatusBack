/*
  Warnings:

  - You are about to drop the column `imageId` on the `ScheduleUploadList` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `ScheduleUploadList` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ScheduleUploadList` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `ScheduleUploadList` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ScheduleUploadList` table. All the data in the column will be lost.
  - Added the required column `date` to the `ScheduleUploadList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `ScheduleUploadList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduleUploadList" DROP CONSTRAINT "ScheduleUploadList_userId_fkey";

-- AlterTable
ALTER TABLE "ScheduleUploadList" DROP COLUMN "imageId",
DROP COLUMN "scheduledDate",
DROP COLUMN "status",
DROP COLUMN "tags",
DROP COLUMN "userId",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "postId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ScheduleUploadList" ADD CONSTRAINT "ScheduleUploadList_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
