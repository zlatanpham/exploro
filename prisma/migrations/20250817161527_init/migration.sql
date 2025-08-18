/*
  Warnings:

  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "language_preference" TEXT NOT NULL DEFAULT 'vi',
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Dish" (
    "id" TEXT NOT NULL,
    "name_vi" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description_vi" TEXT NOT NULL,
    "description_en" TEXT,
    "instructions_vi" TEXT NOT NULL,
    "instructions_en" TEXT,
    "difficulty" TEXT NOT NULL,
    "cook_time" INTEGER NOT NULL,
    "prep_time" INTEGER NOT NULL DEFAULT 0,
    "servings" INTEGER NOT NULL DEFAULT 4,
    "image_url" TEXT,
    "source_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IngredientCategory" (
    "id" TEXT NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "name_vi" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ingredient" (
    "id" TEXT NOT NULL,
    "name_vi" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "category" VARCHAR(100),
    "category_id" TEXT,
    "default_unit" VARCHAR(50),
    "unit_id" TEXT NOT NULL,
    "current_price" DECIMAL(10,2) NOT NULL,
    "density" DECIMAL(10,3),
    "price_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonal_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DishIngredient" (
    "id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" VARCHAR(50),
    "unit_id" TEXT NOT NULL,
    "converted_quantity" DECIMAL(10,3),
    "conversion_factor" DECIMAL(20,10),
    "notes" TEXT,
    "optional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DishIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name_vi" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100),
    "category" VARCHAR(50),

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DishTag" (
    "dish_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "DishTag_pkey" PRIMARY KEY ("dish_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "servings" INTEGER NOT NULL DEFAULT 4,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuDish" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "meal_group" VARCHAR(50),
    "day_index" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuDish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuShare" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "share_code" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT 'view',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FavoriteDish" (
    "user_id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteDish_pkey" PRIMARY KEY ("user_id","dish_id")
);

-- CreateTable
CREATE TABLE "public"."PriceHistory" (
    "id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "unit_id" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitCategory" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "name_vi" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "plural_vi" VARCHAR(100),
    "plural_en" VARCHAR(100),
    "is_base_unit" BOOLEAN NOT NULL DEFAULT false,
    "factor_to_base" DECIMAL(20,10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitConversion" (
    "id" TEXT NOT NULL,
    "from_unit_id" TEXT NOT NULL,
    "to_unit_id" TEXT NOT NULL,
    "factor" DECIMAL(20,10) NOT NULL,
    "is_direct" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "key_hash" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY['read', 'write']::TEXT[],
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,
    "revoke_reason" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiUsageLog" (
    "id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_time" INTEGER NOT NULL,
    "request_body" JSONB,
    "error_message" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dish_name_vi_idx" ON "public"."Dish"("name_vi");

-- CreateIndex
CREATE INDEX "Dish_status_idx" ON "public"."Dish"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientCategory_value_key" ON "public"."IngredientCategory"("value");

-- CreateIndex
CREATE INDEX "IngredientCategory_value_idx" ON "public"."IngredientCategory"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_vi_key" ON "public"."Ingredient"("name_vi");

-- CreateIndex
CREATE INDEX "Ingredient_name_vi_idx" ON "public"."Ingredient"("name_vi");

-- CreateIndex
CREATE INDEX "Ingredient_category_idx" ON "public"."Ingredient"("category");

-- CreateIndex
CREATE INDEX "Ingredient_category_id_idx" ON "public"."Ingredient"("category_id");

-- CreateIndex
CREATE INDEX "Ingredient_unit_id_idx" ON "public"."Ingredient"("unit_id");

-- CreateIndex
CREATE INDEX "DishIngredient_dish_id_idx" ON "public"."DishIngredient"("dish_id");

-- CreateIndex
CREATE INDEX "DishIngredient_ingredient_id_idx" ON "public"."DishIngredient"("ingredient_id");

-- CreateIndex
CREATE INDEX "DishIngredient_unit_id_idx" ON "public"."DishIngredient"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "DishIngredient_dish_id_ingredient_id_key" ON "public"."DishIngredient"("dish_id", "ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_vi_key" ON "public"."Tag"("name_vi");

-- CreateIndex
CREATE INDEX "Tag_name_vi_idx" ON "public"."Tag"("name_vi");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "public"."Tag"("category");

-- CreateIndex
CREATE INDEX "DishTag_dish_id_idx" ON "public"."DishTag"("dish_id");

-- CreateIndex
CREATE INDEX "DishTag_tag_id_idx" ON "public"."DishTag"("tag_id");

-- CreateIndex
CREATE INDEX "Menu_user_id_idx" ON "public"."Menu"("user_id");

-- CreateIndex
CREATE INDEX "Menu_visibility_idx" ON "public"."Menu"("visibility");

-- CreateIndex
CREATE INDEX "MenuDish_menu_id_idx" ON "public"."MenuDish"("menu_id");

-- CreateIndex
CREATE INDEX "MenuDish_dish_id_idx" ON "public"."MenuDish"("dish_id");

-- CreateIndex
CREATE UNIQUE INDEX "MenuShare_share_code_key" ON "public"."MenuShare"("share_code");

-- CreateIndex
CREATE INDEX "MenuShare_menu_id_idx" ON "public"."MenuShare"("menu_id");

-- CreateIndex
CREATE INDEX "MenuShare_share_code_idx" ON "public"."MenuShare"("share_code");

-- CreateIndex
CREATE INDEX "FavoriteDish_user_id_idx" ON "public"."FavoriteDish"("user_id");

-- CreateIndex
CREATE INDEX "FavoriteDish_dish_id_idx" ON "public"."FavoriteDish"("dish_id");

-- CreateIndex
CREATE INDEX "PriceHistory_ingredient_id_idx" ON "public"."PriceHistory"("ingredient_id");

-- CreateIndex
CREATE INDEX "PriceHistory_recorded_at_idx" ON "public"."PriceHistory"("recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "UnitCategory_name_key" ON "public"."UnitCategory"("name");

-- CreateIndex
CREATE INDEX "UnitCategory_name_idx" ON "public"."UnitCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_symbol_key" ON "public"."Unit"("symbol");

-- CreateIndex
CREATE INDEX "Unit_category_id_idx" ON "public"."Unit"("category_id");

-- CreateIndex
CREATE INDEX "Unit_symbol_idx" ON "public"."Unit"("symbol");

-- CreateIndex
CREATE INDEX "UnitConversion_from_unit_id_idx" ON "public"."UnitConversion"("from_unit_id");

-- CreateIndex
CREATE INDEX "UnitConversion_to_unit_id_idx" ON "public"."UnitConversion"("to_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "UnitConversion_from_unit_id_to_unit_id_key" ON "public"."UnitConversion"("from_unit_id", "to_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_hash_key" ON "public"."ApiKey"("key_hash");

-- CreateIndex
CREATE INDEX "ApiKey_organization_id_idx" ON "public"."ApiKey"("organization_id");

-- CreateIndex
CREATE INDEX "ApiKey_key_hash_idx" ON "public"."ApiKey"("key_hash");

-- CreateIndex
CREATE INDEX "ApiKey_expires_at_idx" ON "public"."ApiKey"("expires_at");

-- CreateIndex
CREATE INDEX "ApiKey_is_active_idx" ON "public"."ApiKey"("is_active");

-- CreateIndex
CREATE INDEX "ApiUsageLog_api_key_id_created_at_idx" ON "public"."ApiUsageLog"("api_key_id", "created_at");

-- CreateIndex
CREATE INDEX "ApiUsageLog_endpoint_created_at_idx" ON "public"."ApiUsageLog"("endpoint", "created_at");

-- CreateIndex
CREATE INDEX "ApiUsageLog_status_code_created_at_idx" ON "public"."ApiUsageLog"("status_code", "created_at");

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."IngredientCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DishIngredient" ADD CONSTRAINT "DishIngredient_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "public"."Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DishIngredient" ADD CONSTRAINT "DishIngredient_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DishIngredient" ADD CONSTRAINT "DishIngredient_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DishTag" ADD CONSTRAINT "DishTag_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "public"."Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DishTag" ADD CONSTRAINT "DishTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuDish" ADD CONSTRAINT "MenuDish_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuDish" ADD CONSTRAINT "MenuDish_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "public"."Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuShare" ADD CONSTRAINT "MenuShare_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteDish" ADD CONSTRAINT "FavoriteDish_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteDish" ADD CONSTRAINT "FavoriteDish_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "public"."Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceHistory" ADD CONSTRAINT "PriceHistory_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceHistory" ADD CONSTRAINT "PriceHistory_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."UnitCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitConversion" ADD CONSTRAINT "UnitConversion_from_unit_id_fkey" FOREIGN KEY ("from_unit_id") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitConversion" ADD CONSTRAINT "UnitConversion_to_unit_id_fkey" FOREIGN KEY ("to_unit_id") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
