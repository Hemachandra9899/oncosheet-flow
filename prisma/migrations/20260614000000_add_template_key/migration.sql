-- AlterTable
ALTER TABLE "SheetConnection" ADD COLUMN IF NOT EXISTS "templateKey" TEXT NOT NULL DEFAULT 'oncology_rt';
