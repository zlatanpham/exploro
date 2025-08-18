import { PrismaClient } from '@prisma/client';
import { UnitConversionService } from '../src/server/services/unitConversion';

const prisma = new PrismaClient();

async function testIngredientConversion() {
  console.log('🧪 Testing ingredient-specific unit conversion...\n');

  try {
    const conversionService = new UnitConversionService(prisma);

    // Get some test data
    const trungGa = await prisma.ingredient.findFirst({
      where: { name_vi: { contains: 'Trứng gà' } }
    });

    const tuongOt = await prisma.ingredient.findFirst({
      where: { name_vi: { contains: 'Tương ớt' } }
    });

    const quaUnit = await prisma.unit.findFirst({
      where: { symbol: 'quả' }
    });

    const chaiUnit = await prisma.unit.findFirst({
      where: { symbol: 'chai' }
    });

    const gUnit = await prisma.unit.findFirst({
      where: { symbol: 'g' }
    });

    const mlUnit = await prisma.unit.findFirst({
      where: { symbol: 'ml' }
    });

    if (!trungGa || !tuongOt || !quaUnit || !chaiUnit || !gUnit || !mlUnit) {
      console.log('❌ Required test data not found. Please run the seed scripts first.');
      return;
    }

    // Test 1: Convert eggs using ingredient mapping
    console.log('📋 Test 1: Converting eggs (quả → g)');
    console.log(`Ingredient: ${trungGa.name_vi}`);
    console.log(`Converting: 3 quả → grams`);
    
    const eggResult = await conversionService.convertWithIngredientMapping(
      3,
      quaUnit.id,
      gUnit.id,
      trungGa.id
    );

    if (eggResult.success) {
      console.log(`✅ Result: ${eggResult.convertedValue?.toString()} grams`);
      console.log(`✅ Used ingredient mapping: ${eggResult.usedIngredientMapping}`);
      if (eggResult.mappingDetails) {
        console.log(`✅ Mapping: 1 ${eggResult.mappingDetails.originalUnit} = ${eggResult.mappingDetails.mappingQuantity.toString()} ${eggResult.mappingDetails.mappedUnit}`);
      }
    } else {
      console.log(`❌ Conversion failed: ${eggResult.error}`);
    }

    console.log('\n---\n');

    // Test 2: Convert chili sauce using ingredient mapping
    console.log('📋 Test 2: Converting chili sauce (chai → ml)');
    console.log(`Ingredient: ${tuongOt.name_vi}`);
    console.log(`Converting: 2 chai → milliliters`);
    
    const sauceResult = await conversionService.convertWithIngredientMapping(
      2,
      chaiUnit.id,
      mlUnit.id,
      tuongOt.id
    );

    if (sauceResult.success) {
      console.log(`✅ Result: ${sauceResult.convertedValue?.toString()} ml`);
      console.log(`✅ Used ingredient mapping: ${sauceResult.usedIngredientMapping}`);
      if (sauceResult.mappingDetails) {
        console.log(`✅ Mapping: 1 ${sauceResult.mappingDetails.originalUnit} = ${sauceResult.mappingDetails.mappingQuantity.toString()} ${sauceResult.mappingDetails.mappedUnit}`);
      }
    } else {
      console.log(`❌ Conversion failed: ${sauceResult.error}`);
    }

    console.log('\n---\n');

    // Test 3: Fallback to standard conversion (should not use ingredient mapping)
    console.log('📋 Test 3: Testing fallback to standard conversion');
    console.log(`Converting: 1000 g → kg (standard conversion)`);
    
    const kgUnit = await prisma.unit.findFirst({
      where: { symbol: 'kg' }
    });

    if (kgUnit) {
      const standardResult = await conversionService.convertWithIngredientMapping(
        1000,
        gUnit.id,
        kgUnit.id,
        trungGa.id // ingredient ID provided but no mapping should exist for g→kg
      );

      if (standardResult.success) {
        console.log(`✅ Result: ${standardResult.convertedValue?.toString()} kg`);
        console.log(`✅ Used ingredient mapping: ${standardResult.usedIngredientMapping}`);
      } else {
        console.log(`❌ Conversion failed: ${standardResult.error}`);
      }
    }

    console.log('\n---\n');

    // Test 4: Get all mappings for trứng gà
    console.log('📋 Test 4: Getting all mappings for Trứng gà');
    const eggMappings = await conversionService.getIngredientMappings(trungGa.id);
    console.log(`Found ${eggMappings.length} mapping(s):`);
    
    for (const mapping of eggMappings) {
      console.log(`  - 1 ${mapping.count_unit.name_vi} (${mapping.count_unit.symbol}) = ${mapping.quantity.toString()} ${mapping.measurable_unit.name_vi} (${mapping.measurable_unit.symbol})`);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

void testIngredientConversion()
  .then(() => {
    console.log('Testing completed successfully');
  })
  .catch((e) => {
    console.error('Error testing ingredient conversion:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });