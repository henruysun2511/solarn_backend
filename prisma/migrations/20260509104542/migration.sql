/*
  Warnings:

  - Added the required column `transaction_id` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "transaction_id" TEXT NOT NULL;
