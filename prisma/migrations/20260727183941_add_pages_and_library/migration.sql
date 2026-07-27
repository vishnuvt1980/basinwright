-- CreateEnum
CREATE TYPE "DocKind" AS ENUM ('BLOG', 'CASE_STUDY', 'WHITEPAPER', 'ARTICLE', 'NEWS', 'RESEARCH', 'RELEASE_NOTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionKind" ADD VALUE 'PAGE_HEADER';
ALTER TYPE "SectionKind" ADD VALUE 'PROSE';
ALTER TYPE "SectionKind" ADD VALUE 'FEATURE_GRID';
ALTER TYPE "SectionKind" ADD VALUE 'STAT_BAND';
ALTER TYPE "SectionKind" ADD VALUE 'TIMELINE';
ALTER TYPE "SectionKind" ADD VALUE 'FAQ';
ALTER TYPE "SectionKind" ADD VALUE 'LINK_LIST';
ALTER TYPE "SectionKind" ADD VALUE 'DOC_LIST';
ALTER TYPE "SectionKind" ADD VALUE 'CONTACT';

-- DropIndex
DROP INDEX "sections_order_idx";

-- AlterTable
ALTER TABLE "sections" ADD COLUMN     "page" TEXT NOT NULL DEFAULT 'home';

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eyebrow" TEXT,
    "subtitle" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docs" (
    "id" TEXT NOT NULL,
    "kind" "DocKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "industry" TEXT,
    "author" TEXT,
    "authorRole" TEXT,
    "readMinutes" INTEGER NOT NULL DEFAULT 6,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metrics" JSONB,
    "accent" TEXT,
    "icon" TEXT,
    "gated" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "docs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_order_idx" ON "pages"("order");

-- CreateIndex
CREATE UNIQUE INDEX "docs_slug_key" ON "docs"("slug");

-- CreateIndex
CREATE INDEX "docs_kind_publishedAt_idx" ON "docs"("kind", "publishedAt");

-- CreateIndex
CREATE INDEX "docs_published_publishedAt_idx" ON "docs"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "sections_page_order_idx" ON "sections"("page", "order");
