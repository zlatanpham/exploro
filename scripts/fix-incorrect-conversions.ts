#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixIncorrectConversions() {
  console.log('🔧 Finding and fixing incorrect converted_quantity values...\n');

  try {
    // Find dish ingredients with suspiciously high converted_quantity values
    const suspiciousDishIngredients = await prisma.dishIngredient.findMany({
      where: {
        converted_quantity: {
          gt: 1000 // Greater than 1000 (suspiciously high for spoon measurements)
        },
        unit_ref: {
          symbol: 'muỗng'
        }
      },
      include: {
        dish: { select: { name_vi: true } },
        ingredient: { include: { unit: true } },
        unit_ref: true
      }
    });

    console.log(`Found ${suspiciousDishIngredients.length} dish ingredients with suspicious conversions:`);

    for (const di of suspiciousDishIngredients) {
      console.log(`\n--- ${di.dish.name_vi} - ${di.ingredient.name_vi} ---`);
      console.log(`  Recipe: ${di.quantity} ${di.unit_ref?.symbol}`);
      console.log(`  Current converted_quantity: ${di.converted_quantity?.toString()}`);
      console.log(`  Ingredient unit: ${di.ingredient.unit?.symbol}`);
      
      // Calculate what it should be
      const expectedGrams = Number(di.quantity) * 15; // 1 muỗng = 15g
      
      if (di.ingredient.unit?.symbol === 'g') {
        // If ingredient is in grams, converted_quantity should be ~15g per muỗng
        console.log(`  Expected: ${expectedGrams}g`);
        
        if (di.converted_quantity && Number(di.converted_quantity) !== expectedGrams) {
          console.log(`  🔧 Fixing: ${di.converted_quantity} → ${expectedGrams}`);
          
          await prisma.dishIngredient.update({
            where: { id: di.id },
            data: {
              converted_quantity: expectedGrams,
              conversion_factor: expectedGrams / Number(di.quantity)
            }
          });
        }
      } else if (di.ingredient.unit?.symbol === 'kg') {
        // If ingredient is in kg, converted_quantity should be ~0.015kg per muỗng
        const expectedKg = expectedGrams / 1000;
        console.log(`  Expected: ${expectedKg}kg`);
        
        if (di.converted_quantity && Number(di.converted_quantity) !== expectedKg) {
          console.log(`  🔧 Fixing: ${di.converted_quantity} → ${expectedKg}`);
          
          await prisma.dishIngredient.update({
            where: { id: di.id },
            data: {
              converted_quantity: expectedKg,
              conversion_factor: expectedKg / Number(di.quantity)
            }
          });
        }
      }
    }

    // Now check all muỗng conversions
    console.log('\n📊 All muỗng conversions after fix:');
    const allMuongIngredients = await prisma.dishIngredient.findMany({
      where: {
        unit_ref: { symbol: 'muỗng' }
      },
      include: {
        dish: { select: { name_vi: true } },
        ingredient: { include: { unit: true } },
        unit_ref: true
      }
    });

    allMuongIngredients.forEach(di => {
      const conversionRatio = di.converted_quantity ? Number(di.converted_quantity) / Number(di.quantity) : 0;
      const expectedRatio = di.ingredient.unit?.symbol === 'g' ? 15 : 0.015;
      const isCorrect = Math.abs(conversionRatio - expectedRatio) < 0.001;
      
      console.log(`  ${isCorrect ? '✅' : '❌'} ${di.ingredient.name_vi}: ${di.quantity} muỗng → ${di.converted_quantity?.toString() || 'none'} ${di.ingredient.unit?.symbol} (ratio: ${conversionRatio})`);
    });

    console.log('\n✅ Conversion fixes completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIncorrectConversions();