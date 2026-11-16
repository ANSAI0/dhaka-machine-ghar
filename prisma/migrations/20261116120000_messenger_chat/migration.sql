-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'web',
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "meta" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_externalId_key" ON "ChatSession"("externalId");

