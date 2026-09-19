-- AlterEnum
ALTER TYPE "PlaceCategory" ADD VALUE 'TURISMO';

-- AlterTable
ALTER TABLE "places" ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;

