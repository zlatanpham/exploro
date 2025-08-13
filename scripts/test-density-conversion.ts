#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { UnitConversionService } from '../src/server/services/unitConversion';

const prisma = new PrismaClient();

async function testDensityConversions() {
  console.log('🧪 Testing density-based unit conversions...\n');

  try {
    const conversionService = new UnitConversionService(prisma);

    // Get units
    const muongUnit = await prisma.unit.findUnique({ where: { symbol: 'muỗng' } });
    const mlUnit = await prisma.unit.findUnique({ where: { symbol: 'ml' } });
    const gUnit = await prisma.unit.findUnique({ where: { symbol: 'g' } });

    // Get sesame oil with density
    const dauMe = await prisma.ingredient.findFirst({
      where: { name_vi: 'Dầu mè' },
      include: { unit: true }
    });

    if (!muongUnit || !mlUnit || !gUnit || !dauMe) {
      console.log('❌ Required units or ingredients not found');
      return;
    }

    console.log(`Testing conversions for: ${dauMe.name_vi}`);
    console.log(`Base unit: ${dauMe.unit?.symbol}`);
    console.log(`Price: ${dauMe.current_price?.toLocaleString()}₫ per ${dauMe.unit?.symbol}`);
    console.log(`Density: ${dauMe.density?.toString()} g/ml\n`);

    // Test 1: 1 muỗng (15g) to ml using density
    console.log('🔄 Test 1: 1 muỗng (15g) → ml');
    if (dauMe.density) {
      const result = await conversionService.convertWithDensity(
        15, // 15 grams (1 muỗng)
        gUnit.id,
        mlUnit.id,
        dauMe.density
      );

      if (result.success) {
        console.log(`✅ 15g → ${result.convertedValue?.toString()}ml`);
        console.log(`   (15g ÷ ${dauMe.density} g/ml = ${result.convertedValue?.toString()}ml)`);
      } else {
        console.log(`❌ Conversion failed: ${result.error}`);
      }
    }

    // Test 2: Price calculation for 1 muỗng
    console.log('\n💰 Price calculation for 1 muỗng (15g):');
    
    if (dauMe.unit?.symbol === 'ml' && dauMe.density) {
      // Convert 15g to ml, then calculate price
      const gramsToMl = 15 / dauMe.density.toNumber();
      const pricePerMl = dauMe.current_price?.toNumber() || 0;
      const totalPrice = gramsToMl * pricePerMl;
      
      console.log(`15g ÷ ${dauMe.density} g/ml = ${gramsToMl.toFixed(2)}ml`);
      console.log(`${gramsToMl.toFixed(2)}ml × ${pricePerMl}₫/ml = ${Math.round(totalPrice).toLocaleString()}₫`);
      
      // Compare with direct gram pricing
      const pricePerGram = pricePerMl / dauMe.density.toNumber();
      const directPrice = 15 * pricePerGram;
      console.log(`Direct: 15g × ${Math.round(pricePerGram)}₫/g = ${Math.round(directPrice).toLocaleString()}₫`);
      
      console.log(`\n✅ Both methods should give same result: ${Math.round(totalPrice) === Math.round(directPrice) ? 'MATCH' : 'MISMATCH'}`);
    }

    // Test 3: Real dish ingredient scenario
    console.log('\n🍽️  Real dish scenario: "1 muỗng dầu mè"');
    console.log('Ingredient unit: ml (volume)');
    console.log('Recipe unit: muỗng (mass - 15g)');
    console.log('Need conversion: mass → volume using density');
    
    if (dauMe.density) {
      const muongToMl = 15 / dauMe.density.toNumber();
      const pricePerMl = dauMe.current_price?.toNumber() || 0;
      const finalPrice = muongToMl * pricePerMl;
      
      console.log(`Conversion: 1 muỗng (15g) → ${muongToMl.toFixed(2)}ml`);
      console.log(`Price: ${muongToMl.toFixed(2)}ml × ${pricePerMl}₫/ml = ${Math.round(finalPrice).toLocaleString()}₫`);
      console.log(`This should replace the previous incorrect price of 1,800,000₫!`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDensityConversions();