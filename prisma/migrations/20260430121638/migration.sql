-- CreateTable
CREATE TABLE "tokens" (
    "token_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE INDEX "tokens_account_id_idx" ON "tokens"("account_id");

-- CreateIndex
CREATE INDEX "tokens_token_idx" ON "tokens"("token");

-- CreateIndex
CREATE INDEX "tokens_expires_at_idx" ON "tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;
