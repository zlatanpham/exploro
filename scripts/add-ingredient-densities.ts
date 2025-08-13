#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Common ingredient densities (g/ml)
const INGREDIENT_DENSITIES = {
  'Nước mắm': 1.2,      // Fish sauce: ~1.2 g/ml
  'Dầu ăn': 0.92,       // Cooking oil: ~0.92 g/ml  
  'Dầu mè': 0.94,       // Sesame oil: ~0.94 g/ml
  'Giấm tỏi': 1.05,     // Vinegar: ~1.05 g/ml
  'Nước dừa': 1.0,      // Coconut water: ~1.0 g/ml
  'Sữa tươi': 1.03,     // Fresh milk: ~1.03 g/ml
  'Sữa đặc': 1.35,      // Condensed milk: ~1.35 g/ml
  'Rượu trắng': 0.94,   // White wine/liquor: ~0.94 g/ml
  'Nước tương': 1.15,   // Soy sauce: ~1.15 g/ml
};

async function addIngredientDensities() {
  console.log('🧪 Adding density values to liquid ingredients...\n');

  try {
    let updatedCount = 0;

    for (const [ingredientName, density] of Object.entries(INGREDIENT_DENSITIES)) {
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name_vi: {
            contains: ingredientName,
            mode: 'insensitive'
          }
        },
        include: { unit: true }
      });

      if (ingredient) {
        // Update with density
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: {
            density: density
          }
        });

        console.log(`✅ ${ingredient.name_vi}:`);
        console.log(`   Density: ${density} g/ml`);
        console.log(`   Unit: ${ingredient.unit?.symbol}`);
        console.log(`   Price: ${ingredient.current_price?.toLocaleString()}₫ per ${ingredient.unit?.symbol}`);

        // Calculate equivalent price per gram
        if (ingredient.unit?.symbol === 'ml') {
          const pricePerGram = ingredient.current_price?.toNumber()! / density;
          console.log(`   Equivalent: ${Math.round(pricePerGram).toLocaleString()}₫ per gram`);
        } else if (ingredient.unit?.symbol === 'l') {
          const pricePerGram = (ingredient.current_price?.toNumber()! / 1000) / density;
          console.log(`   Equivalent: ${Math.round(pricePerGram).toLocaleString()}₫ per gram`);
        }

        console.log('');
        updatedCount++;
      } else {
        console.log(`⚠️  Ingredient not found: ${ingredientName}`);
      }
    }

    console.log(`📊 Summary:`);
    console.log(`  Updated ingredients with density: ${updatedCount}`);
    console.log(`  Total density definitions: ${Object.keys(INGREDIENT_DENSITIES).length}`);

    if (updatedCount > 0) {
      console.log(`\n✅ Successfully added density values!`);
      console.log(`These ingredients can now convert between ml/l and grams using density.`);
      console.log(`Example: 1 muỗng (15g) of dầu mè = 15g ÷ 0.94 g/ml ≈ 16ml`);
    }

  } catch (error) {
    console.error('❌ Failed to add densities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addIngredientDensities();