#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying unit migration...\n');

  try {
    // Check DishIngredient table
    console.log('📊 DishIngredient Status:');
    const dishIngredients = await prisma.dishIngredient.findMany({
      include: {
        ingredient: true,
        unit_ref: true,
        dish: {
          select: { name_vi: true }
        }
      }
    });

    console.log(`Total DishIngredient records: ${dishIngredients.length}`);
    
    let migratedCount = 0;
    let legacyCount = 0;
    
    dishIngredients.forEach(di => {
      if (di.unit_id && di.unit_ref) {
        migratedCount++;
        console.log(`✅ ${di.dish.name_vi} - ${di.ingredient.name_vi}: ${di.quantity} ${di.unit_ref.symbol} (${di.unit_ref.name_vi})`);
      } else if (di.unit) {
        legacyCount++;
        console.log(`⚠️  ${di.dish.name_vi} - ${di.ingredient.name_vi}: ${di.quantity} ${di.unit} (legacy)`);
      } else {
        console.log(`❌ ${di.dish.name_vi} - ${di.ingredient.name_vi}: ${di.quantity} (no unit)`);
      }
    });

    console.log(`\n📈 DishIngredient Summary:`);
    console.log(`  Migrated to unit_id: ${migratedCount}`);
    console.log(`  Still using legacy unit: ${legacyCount}`);
    console.log(`  Missing unit data: ${dishIngredients.length - migratedCount - legacyCount}`);

    // Check Ingredient table
    console.log('\n📊 Ingredient Status:');
    const ingredients = await prisma.ingredient.findMany({
      include: {
        unit: true
      }
    });

    console.log(`Total Ingredient records: ${ingredients.length}`);
    
    let ingredientMigratedCount = 0;
    let ingredientLegacyCount = 0;
    
    ingredients.forEach(ing => {
      if (ing.unit_id && ing.unit) {
        ingredientMigratedCount++;
        console.log(`✅ ${ing.name_vi}: ${ing.unit.symbol} (${ing.unit.name_vi})`);
      } else if (ing.default_unit) {
        ingredientLegacyCount++;
        console.log(`⚠️  ${ing.name_vi}: ${ing.default_unit} (legacy)`);
      } else {
        console.log(`❌ ${ing.name_vi}: (no default unit)`);
      }
    });

    console.log(`\n📈 Ingredient Summary:`);
    console.log(`  Migrated to unit_id: ${ingredientMigratedCount}`);
    console.log(`  Still using legacy default_unit: ${ingredientLegacyCount}`);
    console.log(`  Missing unit data: ${ingredients.length - ingredientMigratedCount - ingredientLegacyCount}`);

    // Overall migration success
    const totalMigrated = migratedCount + ingredientMigratedCount;
    const totalRecords = dishIngredients.length + ingredients.length;
    const migrationPercentage = ((totalMigrated / totalRecords) * 100).toFixed(1);

    console.log(`\n🎯 Overall Migration Status:`);
    console.log(`  Total records processed: ${totalRecords}`);
    console.log(`  Successfully migrated: ${totalMigrated} (${migrationPercentage}%)`);
    
    if (migrationPercentage === '100.0') {
      console.log('✅ Migration completed successfully! All records have unit_id references.');
    } else {
      console.log('⚠️  Migration partially completed. Some records still use legacy fields.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration();