#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestDish() {
  console.log('🧪 Creating test dish with unit conversions...\n');

  try {
    // Get units and ingredient
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

    // Create test dish using the tRPC approach
    const { UnitConversionService } = await import('../src/server/services/unitConversion');
    const conversionService = new UnitConversionService(prisma);
    
    console.log(`Creating dish with 100g Hành tím (base price: ${hanhTim.current_price?.toLocaleString()}₫ per ${hanhTim.unit?.symbol})`);
    
    // Calculate conversion from 100g to kg
    const result = await conversionService.convert(100, gUnit.id, hanhTim.unit_id!);
    
    if (!result.success) {
      console.log('❌ Conversion failed:', result.error);
      return;
    }
    
    console.log(`Conversion result: 100g → ${result.convertedValue?.toString()}kg`);
    
    // Create test dish
    const testDish = await prisma.dish.create({
      data: {
        name_vi: 'Món Test Chuyển Đổi Đơn Vị',
        name_en: 'Unit Conversion Test Dish',
        description_vi: 'Món test để kiểm tra chuyển đổi đơn vị và tính giá',
        description_en: 'Test dish for unit conversion and pricing',
        instructions_vi: 'Hướng dẫn test',
        instructions_en: 'Test instructions',
        difficulty: 'easy',
        cook_time: 10,
        prep_time: 5,
        servings: 2,
        status: 'active'
      }
    });

    // Add the problematic ingredient (100g when base unit is kg)
    await prisma.dishIngredient.create({
      data: {
        dish_id: testDish.id,
        ingredient_id: hanhTim.id,
        quantity: 100, // 100 grams
        unit_id: gUnit.id, // gram unit
        converted_quantity: result.convertedValue!, // 0.1 kg
        conversion_factor: result.convertedValue!.div(100) // 0.001
      }
    });

    console.log(`✅ Created test dish: ${testDish.name_vi} (ID: ${testDish.id})`);
    console.log(`📍 You can test this at: /dishes/${testDish.id}`);
    
    // Fetch and display the created data
    const createdDish = await prisma.dish.findUnique({
      where: { id: testDish.id },
      include: {
        DishIngredient: {
          include: {
            ingredient: { include: { unit: true } },
            unit_ref: true
          }
        }
      }
    });

    console.log('\n📊 Created dish ingredient data:');
    createdDish?.DishIngredient.forEach(di => {
      console.log(`  - Ingredient: ${di.ingredient.name_vi}`);
      console.log(`    Quantity: ${di.quantity} ${di.unit_ref?.symbol}`);
      console.log(`    Converted: ${di.converted_quantity?.toString()} ${di.ingredient.unit?.symbol}`);
      console.log(`    Base price: ${di.ingredient.current_price?.toLocaleString()}₫ per ${di.ingredient.unit?.symbol}`);
      
      const correctPrice = Number(di.converted_quantity) * Number(di.ingredient.current_price);
      console.log(`    Should cost: ${correctPrice.toLocaleString()}₫`);
    });

  } catch (error) {
    console.error('❌ Failed to create test dish:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDish();