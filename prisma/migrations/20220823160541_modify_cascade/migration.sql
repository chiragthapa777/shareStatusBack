-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleUploadList" DROP CONSTRAINT "ScheduleUploadList_postId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_postId_fkey";

-- DropForeignKey
ALTER TABLE "Tag_Post" DROP CONSTRAINT "Tag_Post_postId_fkey";

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag_Post" ADD CONSTRAINT "Tag_Post_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleUploadList" ADD CONSTRAINT "ScheduleUploadList_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
