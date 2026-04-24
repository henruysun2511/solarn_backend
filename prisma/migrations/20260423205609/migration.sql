-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "email_verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_otps" (
    "otp_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'REGISTER',
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("otp_id")
);

-- CreateIndex
CREATE INDEX "email_otps_profile_id_idx" ON "email_otps"("profile_id");

-- CreateIndex
CREATE INDEX "email_otps_email_idx" ON "email_otps"("email");

-- CreateIndex
CREATE INDEX "email_otps_expires_at_idx" ON "email_otps"("expires_at");

-- AddForeignKey
ALTER TABLE "email_otps" ADD CONSTRAINT "email_otps_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
