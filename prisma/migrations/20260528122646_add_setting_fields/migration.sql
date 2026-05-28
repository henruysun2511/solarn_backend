-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "hotline" VARCHAR(20),
ADD COLUMN     "meta_description" TEXT,
ADD COLUMN     "meta_title" VARCHAR(255);
