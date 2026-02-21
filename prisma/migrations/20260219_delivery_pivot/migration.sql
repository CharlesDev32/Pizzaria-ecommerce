-- Incremental delivery pivot migration.
-- This migration preserves legacy records and adds delivery-oriented structures.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ordertype') THEN
    CREATE TYPE "OrderType" AS ENUM ('DELIVERY');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentmethod') THEN
    CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'CARD_ON_DELIVERY');
  END IF;
END$$;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderType" "OrderType" NOT NULL DEFAULT 'DELIVERY';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryFee" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod";
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "changeFor" DECIMAL(65,30);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "addressSnapshot" JSONB;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "slotId" TEXT;

CREATE TABLE IF NOT EXISTS "DeliveryZone" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "fee" DECIMAL(65,30) NOT NULL,
  "minOrderValue" DECIMAL(65,30),
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Neighborhood" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "deliveryZoneId" TEXT NOT NULL REFERENCES "DeliveryZone"("id") ON DELETE CASCADE,
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "CustomerAddress" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "complement" TEXT,
  "neighborhoodId" TEXT NOT NULL REFERENCES "Neighborhood"("id") ON DELETE CASCADE,
  "reference" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "MenuOptionGroup" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "minSelect" INTEGER NOT NULL DEFAULT 0,
  "maxSelect" INTEGER NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "MenuOption" (
  "id" TEXT PRIMARY KEY,
  "groupId" TEXT NOT NULL REFERENCES "MenuOptionGroup"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "priceDelta" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "DeliverySlot" (
  "id" TEXT PRIMARY KEY,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

