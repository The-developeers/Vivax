-- AlterTable
ALTER TABLE "places" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[];

