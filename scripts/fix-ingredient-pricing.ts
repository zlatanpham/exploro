#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Reasonable pricing in VND (Vietnamese Dong) per unit
const PRICING_FIXES = [
  // Sweet potato - should be around 25,000-30,000 VND per kg, not 12,500,000
  { name_vi: "Khoai so", reasonable_price: 25000 }, // 25,000 VND per kg
  { name_vi: "khoai so", reasonable_price: 25000 }, // case variation

  // Purple onion/Shallot - should be around 30,000-40,000 VND per kg, not 3,000,000
  { name_vi: "Hành tím", reasonable_price: 35000 }, // 35,000 VND per kg
  { name_vi: "hành tím", reasonable_price: 35000 }, // case variation

  // Rice vermicelli - should be around 20,000-30,000 VND per kg, not 6,000,000
  { name_vi: "Bún", reasonable_price: 25000 }, // 25,000 VND per kg
  { name_vi: "bún", reasonable_price: 25000 }, // case variation
  { name_vi: "Bún tươi", reasonable_price: 20000 }, // fresh rice vermicelli
  { name_vi: "bún tươi", reasonable_price: 20000 },
];

async function fixIngredientPricing() {
  console.log("🛠️  Starting ingredient pricing fix...\n");

  try {
    let fixedCount = 0;
    let notFoundCount = 0;

    for (const fix of PRICING_FIXES) {
      // Find ingredient by Vietnamese name
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name_vi: {
            equals: fix.name_vi,
            mode: "insensitive", // Case insensitive search
          },
        },
        include: {
          unit: true,
        },
      });

      if (ingredient) {
        const oldPrice = ingredient.current_price;

        // Only update if the current price seems unreasonably high (> 1,000,000)
        if (oldPrice && Number(oldPrice) > 1000000) {
          await prisma.ingredient.update({
            where: { id: ingredient.id },
            data: { current_price: fix.reasonable_price },
          });

          console.log(
            `✅ Fixed "${ingredient.name_vi}": ${oldPrice.toLocaleString()}₫ → ${fix.reasonable_price.toLocaleString()}₫ per ${ingredient.unit?.symbol || "unit"}`,
          );
          fixedCount++;
        } else {
          console.log(
            `ℹ️  "${ingredient.name_vi}" already has reasonable pricing: ${oldPrice?.toLocaleString() || "N/A"}₫ per ${ingredient.unit?.symbol || "unit"}`,
          );
        }
      } else {
        console.log(`⚠️  Ingredient not found: "${fix.name_vi}"`);
        notFoundCount++;
      }
    }

    // Also check for any other ingredients with suspiciously high prices
    console.log(
      "\n🔍 Checking for other ingredients with suspiciously high prices (> 500,000₫)...",
    );

    const expensiveIngredients = await prisma.ingredient.findMany({
      where: {
        current_price: {
          gt: 500000, // Greater than 500,000 VND
        },
      },
      include: {
        unit: true,
      },
      orderBy: {
        current_price: "desc",
      },
    });

    if (expensiveIngredients.length > 0) {
      console.log(
        "\n⚠️  Found ingredients with high prices that may need review:",
      );
      expensiveIngredients.forEach((ing) => {
        console.log(
          `  - "${ing.name_vi}": ${ing.current_price?.toLocaleString()}₫ per ${ing.unit?.symbol || "unit"}`,
        );
      });
    } else {
      console.log(
        "\n✅ No other ingredients with suspiciously high prices found.",
      );
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`  Fixed ingredients: ${fixedCount}`);
    console.log(`  Not found: ${notFoundCount}`);
    console.log(
      `  Ingredients with high prices requiring review: ${expensiveIngredients.length}`,
    );

    if (fixedCount > 0) {
      console.log(
        "\n✅ Ingredient pricing has been fixed! Prices are now more reasonable.",
      );
    } else {
      console.log(
        "\n✅ No pricing fixes needed. All ingredient prices appear reasonable.",
      );
    }
  } catch (error) {
    console.error("❌ Failed to fix ingredient pricing:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixIngredientPricing();
