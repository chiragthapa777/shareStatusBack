/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `ScheduleUploadList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ScheduleUploadList_postId_key" ON "ScheduleUploadList"("postId");
