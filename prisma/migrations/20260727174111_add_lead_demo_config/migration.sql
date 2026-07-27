-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "demoConfig" JSONB,
ADD COLUMN     "industry" TEXT;

-- CreateIndex
CREATE INDEX "leads_industry_idx" ON "leads"("industry");
