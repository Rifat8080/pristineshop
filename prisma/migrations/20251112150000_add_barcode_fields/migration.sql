-- Migration: add sku, barcode, barcodeFormat to Product

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" text;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "barcode" text;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "barcodeFormat" text DEFAULT 'CODE128';

-- Add unique constraints (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_sku_key'
  ) THEN
    ALTER TABLE "Product" ADD CONSTRAINT product_sku_key UNIQUE ("sku");
  END IF;
EXCEPTION WHEN duplicate_table THEN
  -- ignore
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_barcode_key'
  ) THEN
    ALTER TABLE "Product" ADD CONSTRAINT product_barcode_key UNIQUE ("barcode");
  END IF;
EXCEPTION WHEN duplicate_table THEN
  -- ignore
END$$;
