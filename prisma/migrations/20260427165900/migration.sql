/*
  Warnings:

  - You are about to drop the column `is_active` on the `class_schedule_templates` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "class_schedule_templates_is_active_idx";

-- AlterTable
ALTER TABLE "class_schedule_templates" DROP COLUMN "is_active";
