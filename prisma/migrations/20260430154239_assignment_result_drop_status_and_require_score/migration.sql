/*
  Warnings:

  - You are about to drop the column `status` on the `assignment_results` table. All the data in the column will be lost.
  - Made the column `score` on table `assignment_results` required. This step will fail if there are existing NULL values in that column.

*/

-- Backfill existing NULL scores to keep migration safe
UPDATE "assignment_results" SET "score" = 0 WHERE "score" IS NULL;

-- AlterTable
ALTER TABLE "assignment_results" DROP COLUMN "status",
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;

-- DropEnum
DROP TYPE "GradeStatus";
