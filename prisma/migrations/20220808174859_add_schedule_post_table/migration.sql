-- CreateTable
CREATE TABLE "ScheduleUploadList" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "imageId" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleUploadList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScheduleUploadList" ADD CONSTRAINT "ScheduleUploadList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
