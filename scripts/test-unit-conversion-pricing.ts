#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { UnitConversionService } from '../src/server/services/unitConversion';

const prisma = new PrismaClient();

async function testUnitConversionPricing() {
  console.log('🧪 Testing unit conversion pricing...\n');

  try {
    // Get units
    const kgUnit = await prisma.unit.findUnique({ where: { symbol: 'kg' } });
    const gUnit = await prisma.unit.findUnique({ where: { symbol: 'g' } });
    const hanhTim = await prisma.ingredient.findFirst({ 
      where: { name_vi: 'Hành tím' },
      include: { unit: true }
    });

    if (!kgUnit || !gUnit || !hanhTim) {
      console.log('❌ Required units or ingredients not found');
      return;
    }

    console.log(`Found ingredient: ${hanhTim.name_vi}`);
    console.log(`Base unit: ${hanhTim.unit?.symbol} (${hanhTim.unit?.name_vi})`);
    console.log(`Price: ${hanhTim.current_price?.toLocaleString()}₫ per ${hanhTim.unit?.symbol}\n`);

    // Test conversion: 100g of hành tím
    const conversionService = new UnitConversionService(prisma);
    
    console.log('Testing conversion: 100g → kg');
    const result = await conversionService.convert(100, gUnit.id, kgUnit.id);
    
    if (result.success && result.convertedValue) {
      console.log(`✅ Conversion successful:`);
      console.log(`  100g = ${result.convertedValue.toString()}kg`);
      console.log(`  Converted value: ${result.convertedValue.toNumber()}`);
      
      // Calculate prices
      const basePrice = hanhTim.current_price?.toNumber() || 0;
      const correctPrice = result.convertedValue.toNumber() * basePrice;
      const wrongPrice = 100 * basePrice; // What would happen with wrong calculation
      
      console.log(`\n💰 Price calculations:`);
      console.log(`  Base price: ${basePrice.toLocaleString()}₫ per kg`);
      console.log(`  ✅ Correct: ${result.convertedValue.toNumber()}kg × ${basePrice.toLocaleString()}₫/kg = ${correctPrice.toLocaleString()}₫`);
      console.log(`  ❌ Wrong:   100g × ${basePrice.toLocaleString()}₫/kg = ${wrongPrice.toLocaleString()}₫`);
      
      console.log(`\n📊 Expected result for 100g Hành tím:`);
      console.log(`  Should cost: ${correctPrice.toLocaleString()}₫ (${correctPrice} VND)`);
      console.log(`  Currently shows: ${wrongPrice.toLocaleString()}₫ (if using wrong calculation)`);
      
    } else {
      console.log(`❌ Conversion failed: ${result.error}`);
    }

    // Create a test dish ingredient with unit conversion
    console.log(`\n🧪 Creating test dish ingredient...`);
    
    const testDish = await prisma.dish.create({
      data: {
        name_vi: 'Test Unit Conversion Dish',
        name_en: 'Test Unit Conversion Dish',
        description_vi: 'Test dish for unit conversion pricing',
        description_en: 'Test dish for unit conversion pricing',
        instructions_vi: 'Test instructions',
        difficulty: 'easy',
        cook_time: 10,
        prep_time: 5,
        servings: 1,
        status: 'active'
      }
    });

    // Add ingredient with different unit (100g instead of kg)
    const dishIngredient = await prisma.dishIngredient.create({
      data: {
        dish_id: testDish.id,
        ingredient_id: hanhTim.id,
        quantity: 100, // 100 grams
        unit_id: gUnit.id, // grams unit
        converted_quantity: result.success ? result.convertedValue : null,
        conversion_factor: result.success ? result.convertedValue?.div(100) : null
      }
    });

    console.log(`✅ Created test dish ingredient:`);
    console.log(`  Dish: ${testDish.name_vi}`);
    console.log(`  Ingredient: 100g ${hanhTim.name_vi}`);
    console.log(`  Converted quantity: ${dishIngredient.converted_quantity?.toString() || 'none'}`);
    
    // Clean up
    await prisma.dishIngredient.delete({ where: { id: dishIngredient.id } });
    await prisma.dish.delete({ where: { id: testDish.id } });
    console.log(`\n🧹 Cleaned up test data`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUnitConversionPricing();