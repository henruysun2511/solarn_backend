/*
  Warnings:

  - You are about to drop the column `teacher_id` on the `attendances` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,session_id]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_id` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_teacher_id_fkey";

-- DropIndex
DROP INDEX "attendances_teacher_id_idx";

-- DropIndex
DROP INDEX "attendances_teacher_id_session_id_key";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "teacher_id",
ADD COLUMN     "student_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "attendances_student_id_idx" ON "attendances"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_student_id_session_id_key" ON "attendances"("student_id", "session_id");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
