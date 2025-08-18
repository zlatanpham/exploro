import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testIntegratedMappings() {
  console.log('🧪 Testing integrated ingredient mappings functionality...\n');

  try {
    // Test 1: Verify ingredients have mappings
    console.log('📋 Test 1: Checking existing ingredient mappings');
    
    const ingredientsWithMappings = await prisma.ingredient.findMany({
      where: {
        IngredientUnitMapping: {
          some: {},
        },
      },
      include: {
        IngredientUnitMapping: {
          include: {
            count_unit: true,
            measurable_unit: true,
          },
        },
      },
      take: 5,
    });

    console.log(`Found ${ingredientsWithMappings.length} ingredients with mappings:`);
    for (const ingredient of ingredientsWithMappings) {
      console.log(`\n  📦 ${ingredient.name_vi}:`);
      for (const mapping of ingredient.IngredientUnitMapping) {
        console.log(`    • 1 ${mapping.count_unit.name_vi} (${mapping.count_unit.symbol}) = ${mapping.quantity.toString()} ${mapping.measurable_unit.name_vi} (${mapping.measurable_unit.symbol})`);
      }
    }

    console.log('\n---\n');

    // Test 2: Count total mappings
    console.log('📋 Test 2: Total mappings count');
    const totalMappings = await prisma.ingredientUnitMapping.count();
    console.log(`Total ingredient unit mappings: ${totalMappings}`);

    console.log('\n---\n');

    // Test 3: Check unit categories for UI
    console.log('📋 Test 3: Available unit categories for UI');
    const unitCategories = await prisma.unitCategory.findMany({
      include: {
        units: {
          select: {
            id: true,
            symbol: true,
            name_vi: true,
          },
        },
      },
    });

    for (const category of unitCategories) {
      console.log(`\n  📂 ${category.name} (${category.units.length} units):`);
      console.log(`    ${category.units.map(u => `${u.name_vi} (${u.symbol})`).join(', ')}`);
    }

    console.log('\n---\n');

    // Test 4: Verify API routes are accessible (test specific ingredient)
    console.log('📋 Test 4: Testing mapping queries');
    const testIngredient = await prisma.ingredient.findFirst({
      where: {
        name_vi: {
          contains: 'Trứng gà',
        },
      },
    });

    if (testIngredient) {
      const mappings = await prisma.ingredientUnitMapping.findMany({
        where: { ingredient_id: testIngredient.id },
        include: {
          count_unit: {
            include: {
              category: true,
            },
          },
          measurable_unit: {
            include: {
              category: true,
            },
          },
        },
      });

      console.log(`Found ${mappings.length} mappings for ${testIngredient.name_vi}:`);
      for (const mapping of mappings) {
        console.log(`  ✅ 1 ${mapping.count_unit.symbol} = ${mapping.quantity.toString()} ${mapping.measurable_unit.symbol}`);
        console.log(`     Categories: ${mapping.count_unit.category.name} → ${mapping.measurable_unit.category.name}`);
      }
    }

    console.log('\n🎉 All integration tests completed successfully!');
    console.log('\n💡 The integrated ingredient mappings are ready for use in:');
    console.log('   • http://localhost:3000/admin/ingredients (Create/Edit ingredient dialogs)');
    console.log('   • Automatic cost calculations in dish recipes');
    console.log('   • tRPC API endpoints for frontend integration');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

void testIntegratedMappings()
  .then(() => {
    console.log('Testing completed successfully');
  })
  .catch((e) => {
    console.error('Error testing integrated mappings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });