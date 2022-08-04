-- AlterTable
ALTER TABLE "UserSetting" ADD COLUMN     "chatNotication" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "commentNotication" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "followNotication" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "likeNotication" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shareNotication" BOOLEAN NOT NULL DEFAULT true;
