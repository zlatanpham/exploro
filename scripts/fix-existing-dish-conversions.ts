#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { UnitConversionService } from '../src/server/services/unitConversion';

const prisma = new PrismaClient();

async function fixExistingDishConversions() {
  console.log('🔧 Fixing existing dish ingredient unit conversions...\n');

  try {
    const conversionService = new UnitConversionService(prisma);

    // Find all dish ingredients that might need conversion
    const dishIngredients = await prisma.dishIngredient.findMany({
      include: {
        ingredient: { include: { unit: true } },
        unit_ref: true,
        dish: { select: { name_vi: true, id: true } }
      },
      where: {
        // Only ones that don't have converted_quantity yet
        converted_quantity: null
      }
    });

    console.log(`Found ${dishIngredients.length} dish ingredients to check for conversion needs`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const di of dishIngredients) {
      // Check if conversion is needed (different units)
      if (di.unit_id && di.ingredient.unit_id && di.unit_id !== di.ingredient.unit_id) {
        console.log(`\n🔄 Converting: ${di.dish.name_vi} - ${di.ingredient.name_vi}`);
        console.log(`  From: ${di.quantity} ${di.unit_ref?.symbol || 'unknown'}`);
        console.log(`  To: ${di.ingredient.unit?.symbol || 'unknown'} (ingredient base unit)`);

        const result = await conversionService.convert(
          di.quantity,
          di.unit_id,
          di.ingredient.unit_id
        );

        if (result.success && result.convertedValue) {
          await prisma.dishIngredient.update({
            where: { id: di.id },
            data: {
              converted_quantity: result.convertedValue,
              conversion_factor: result.convertedValue.div(di.quantity),
            }
          });

          console.log(`  ✅ Result: ${result.convertedValue.toString()} ${di.ingredient.unit?.symbol}`);
          
          // Show price calculation
          const correctPrice = result.convertedValue.toNumber() * di.ingredient.current_price.toNumber();
          const wrongPrice = di.quantity.toNumber() * di.ingredient.current_price.toNumber();
          console.log(`  💰 Correct price: ${correctPrice.toLocaleString()}₫`);
          console.log(`  ❌ Would be wrong: ${wrongPrice.toLocaleString()}₫`);

          updatedCount++;
        } else {
          console.log(`  ❌ Conversion failed: ${result.error}`);
          skippedCount++;
        }
      } else {
        console.log(`⏭️  Skipping ${di.dish.name_vi} - ${di.ingredient.name_vi} (same units)`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Updated with conversions: ${updatedCount}`);
    console.log(`  Skipped (no conversion needed): ${skippedCount}`);
    console.log(`  Total processed: ${dishIngredients.length}`);

    if (updatedCount > 0) {
      console.log(`\n✅ Fixed ${updatedCount} dish ingredients with proper unit conversions!`);
      console.log(`These should now show correct pricing in the frontend.`);
    } else {
      console.log(`\n✅ All dish ingredients already have proper unit data.`);
    }

  } catch (error) {
    console.error('❌ Failed to fix dish conversions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingDishConversions();