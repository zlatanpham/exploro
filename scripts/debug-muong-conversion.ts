#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { UnitConversionService } from '../src/server/services/unitConversion';

const prisma = new PrismaClient();

async function debugMuongConversion() {
  console.log('🔍 Debugging muỗng conversion issue...\n');

  try {
    const conversionService = new UnitConversionService(prisma);
    
    // Get units
    const muongUnit = await prisma.unit.findUnique({ where: { symbol: 'muỗng' } });
    const gUnit = await prisma.unit.findUnique({ where: { symbol: 'g' } });
    
    if (!muongUnit || !gUnit) {
      console.log('❌ Units not found');
      return;
    }

    // Test conversion: 1 muỗng to grams
    console.log('Testing conversion: 1 muỗng → grams');
    const result = await conversionService.convert(1, muongUnit.id, gUnit.id);
    
    if (result.success) {
      console.log(`✅ 1 muỗng = ${result.convertedValue?.toString()}g`);
    } else {
      console.log(`❌ Conversion failed: ${result.error}`);
    }

    // Check pepper ingredient (from your screenshot)
    const tieuIngredient = await prisma.ingredient.findFirst({
      where: { 
        OR: [
          { name_vi: { contains: 'Tiêu', mode: 'insensitive' } },
          { name_vi: { contains: 'tiêu', mode: 'insensitive' } }
        ]
      },
      include: { unit: true }
    });

    if (tieuIngredient) {
      console.log(`\nFound ingredient: ${tieuIngredient.name_vi}`);
      console.log(`Base unit: ${tieuIngredient.unit?.symbol}`);
      console.log(`Price: ${tieuIngredient.current_price?.toLocaleString()}₫ per ${tieuIngredient.unit?.symbol}`);
      
      // Find dish ingredients using pepper with muỗng
      const dishIngredients = await prisma.dishIngredient.findMany({
        where: {
          ingredient_id: tieuIngredient.id,
          unit_ref: { symbol: 'muỗng' }
        },
        include: {
          dish: { select: { name_vi: true } },
          ingredient: { include: { unit: true } },
          unit_ref: true
        }
      });

      console.log(`\nFound ${dishIngredients.length} dish ingredients using muỗng with ${tieuIngredient.name_vi}:`);
      
      dishIngredients.forEach(di => {
        console.log(`\n--- ${di.dish.name_vi} ---`);
        console.log(`  Ingredient: ${di.ingredient.name_vi}`);
        console.log(`  Recipe: ${di.quantity} ${di.unit_ref?.symbol} (${di.unit_ref?.category})`);
        console.log(`  Base unit: ${di.ingredient.unit?.symbol}`);
        console.log(`  Converted quantity: ${di.converted_quantity?.toString() || 'none'}`);
        console.log(`  Price: ${di.ingredient.current_price}₫ per ${di.ingredient.unit?.symbol}`);
        
        if (di.converted_quantity) {
          const conversionRatio = Number(di.converted_quantity) / Number(di.quantity);
          console.log(`  Conversion ratio: 1 muỗng = ${conversionRatio}${di.ingredient.unit?.symbol}`);
          
          if (conversionRatio > 1000) {
            console.log(`  ❌ PROBLEM: Ratio is too high! Should be ~15 for grams`);
          }
          
          const price = Number(di.converted_quantity) * Number(di.ingredient.current_price);
          console.log(`  Calculated price: ${price.toLocaleString()}₫`);
        }
      });
    } else {
      console.log('\n⚠️  Pepper ingredient not found');
    }

    // Also check all ingredients using muỗng
    console.log('\n📊 All ingredients using muỗng unit:');
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
      console.log(`  - ${di.ingredient.name_vi}: ${di.quantity} muỗng → ${di.converted_quantity?.toString() || 'none'} ${di.ingredient.unit?.symbol} (ratio: ${conversionRatio})`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMuongConversion();