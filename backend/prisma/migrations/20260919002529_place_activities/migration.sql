-- AlterTable
ALTER TABLE "places" ADD COLUMN     "openingHours" TEXT;

-- CreateTable
CREATE TABLE "place_activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "imageUrl" TEXT,
    "placeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "place_activities" ADD CONSTRAINT "place_activities_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

