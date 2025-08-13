#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMuongTestDish() {
  console.log('🧪 Creating test dish with muỗng units...\n');

  try {
    // Get units and ingredients
    const muongUnit = await prisma.unit.findUnique({ where: { symbol: 'muỗng' } });
    const dauMe = await prisma.ingredient.findFirst({ 
      where: { name_vi: 'Dầu mè' },
      include: { unit: true }
    });

    if (!muongUnit || !dauMe) {
      console.log('❌ Required units or ingredients not found');
      return;
    }

    console.log(`Muong unit category: ${muongUnit.category_id}`);
    console.log(`Dau me unit: ${dauMe.unit?.symbol}, density: ${dauMe.density?.toString()}`);

    // Create test dish
    const testDish = await prisma.dish.create({
      data: {
        name_vi: 'Món Test Muỗng Conversion',
        name_en: 'Spoon Conversion Test Dish',
        description_vi: 'Test dish for muỗng to ml conversion using density',
        description_en: 'Test dish for spoon to ml conversion using density',
        instructions_vi: 'Test instructions',
        instructions_en: 'Test instructions',
        difficulty: 'easy',
        cook_time: 5,
        prep_time: 2,
        servings: 1,
        status: 'active'
      }
    });

    // Add ingredient with muỗng unit (should convert to ml using density)
    await prisma.dishIngredient.create({
      data: {
        dish_id: testDish.id,
        ingredient_id: dauMe.id,
        quantity: 1, // 1 muỗng (15g)
        unit_id: muongUnit.id,
        // Don't set converted_quantity - let the system calculate it
      }
    });

    console.log(`✅ Created test dish: ${testDish.name_vi} (ID: ${testDish.id})`);
    console.log(`📍 Test this at: /dishes/${testDish.id}`);
    
    console.log('\n📊 Expected behavior:');
    console.log('1. System detects: muỗng (mass) vs ml (volume) - different categories');
    console.log('2. Regular conversion fails (cannot convert mass to volume)');
    console.log('3. System tries density conversion: 1 muỗng (15g) → 15.96ml using density 0.94 g/ml');
    console.log('4. Price calculation: 15.96ml × 300₫/ml = 4,787₫');
    console.log('5. Display: "1 muỗng = 15.96ml" and cost "4,787₫"');

  } catch (error) {
    console.error('❌ Failed to create test dish:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMuongTestDish();