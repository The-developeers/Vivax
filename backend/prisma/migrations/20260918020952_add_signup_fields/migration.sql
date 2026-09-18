-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressNumber" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

