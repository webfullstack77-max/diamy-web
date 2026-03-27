-- CreateTable
CREATE TABLE "ads_queue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT,
    "channels" TEXT NOT NULL DEFAULT '[]',
    "scheduleTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "sentAt" TIMESTAMP(3),
    "errorLog" TEXT,
    "fbPostId" TEXT,
    "igPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ads_queue_pkey" PRIMARY KEY ("id")
);
