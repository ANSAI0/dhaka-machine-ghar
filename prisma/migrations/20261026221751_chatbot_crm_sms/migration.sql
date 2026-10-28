-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messages" JSONB NOT NULL,
    "page" TEXT,
    "ip" TEXT,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'chatbot',
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNote" TEXT,
    "chatId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "orderId" TEXT,
    "status" TEXT NOT NULL,
    "response" TEXT,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "SmsLog_orderId_idx" ON "SmsLog"("orderId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ChatSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
