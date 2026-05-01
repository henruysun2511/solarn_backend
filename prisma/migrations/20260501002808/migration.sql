/*
  Warnings:

  - Added the required column `room_code` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "room_code" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_room_code_fkey" FOREIGN KEY ("room_code") REFERENCES "rooms"("room_code") ON DELETE RESTRICT ON UPDATE CASCADE;
