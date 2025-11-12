-- Migration: add price, image, description, title, subtitle to Product

ALTER TABLE "Product"
  ADD COLUMN "price" double precision NOT NULL DEFAULT 0;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "subtitle" text;
