/*
  Warnings:

  - Made the column `star_rating` on table `feedbacks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "feedbacks" ALTER COLUMN "star_rating" SET NOT NULL;
