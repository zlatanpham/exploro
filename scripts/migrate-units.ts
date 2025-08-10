import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping of old string units to new unit symbols
const UNIT_MAPPING: Record<string, string> = {
  // Mass units
  'kg': 'kg',
  'g': 'g',
  'gram': 'g',
  'kilogram': 'kg',
  'kilogam': 'kg', // typo variations
  
  // Volume units
  'l': 'l',
  'lít': 'l',
  'lit': 'l',
  'ml': 'ml',
  'mililít': 'ml',
  'mililit': 'ml',
  'thìa': 'thìa',
  'thìa canh': 'thìa',
  'thìa cà phê': 'thìa nhỏ',
  'thìa nhỏ': 'thìa nhỏ',
  'chén': 'chén',
  'chen': 'chén',
  
  // Count units
  'cái': 'cái',
  'cai': 'cái',
  'quả': 'quả',
  'qua': 'quả',
  'bó': 'bó',
  'bo': 'bó',
  'nắm': 'nắm',
  'nam': 'nắm',
  'gói': 'gói',
  'goi': 'gói',
  'hộp': 'hộp',
  'hop': 'hộp',
};

async function migrateUnits() {
  console.log('Starting unit migration...');

  try {
    // Load all units from database
    const units = await prisma.unit.findMany();
    const unitsBySymbol = new Map(units.map(u => [u.symbol, u]));

    // Migrate ingredients
    console.log('\nMigrating ingredients...');
    const ingredients = await prisma.ingredient.findMany({
      where: {
        default_unit: { not: null },
        unit_id: null,
      },
    });

    let migratedIngredients = 0;
    let failedIngredients = 0;

    for (const ingredient of ingredients) {
      if (!ingredient.default_unit) continue;

      const normalizedUnit = ingredient.default_unit.toLowerCase().trim();
      const mappedSymbol = UNIT_MAPPING[normalizedUnit];
      
      if (mappedSymbol) {
        const unit = unitsBySymbol.get(mappedSymbol);
        if (unit) {
          await prisma.ingredient.update({
            where: { id: ingredient.id },
            data: { unit_id: unit.id },
          });
          migratedIngredients++;
          console.log(`✓ Migrated ingredient "${ingredient.name_vi}" from "${ingredient.default_unit}" to unit "${unit.symbol}"`);
        } else {
          console.log(`✗ Unit not found for symbol "${mappedSymbol}" (ingredient: ${ingredient.name_vi})`);
          failedIngredients++;
        }
      } else {
        console.log(`✗ No mapping found for unit "${ingredient.default_unit}" (ingredient: ${ingredient.name_vi})`);
        failedIngredients++;
      }
    }

    console.log(`\nIngredients: ${migratedIngredients} migrated, ${failedIngredients} failed`);

    // Migrate dish ingredients
    console.log('\nMigrating dish ingredients...');
    const dishIngredients = await prisma.dishIngredient.findMany({
      where: {
        unit: { not: null },
        unit_id: null,
      },
      include: {
        ingredient: true,
        dish: true,
      },
    });

    let migratedDishIngredients = 0;
    let failedDishIngredients = 0;

    for (const dishIngredient of dishIngredients) {
      if (!dishIngredient.unit) continue;

      const normalizedUnit = dishIngredient.unit.toLowerCase().trim();
      const mappedSymbol = UNIT_MAPPING[normalizedUnit];
      
      if (mappedSymbol) {
        const unit = unitsBySymbol.get(mappedSymbol);
        if (unit) {
          await prisma.dishIngredient.update({
            where: { id: dishIngredient.id },
            data: { unit_id: unit.id },
          });
          migratedDishIngredients++;
          console.log(`✓ Migrated dish ingredient "${dishIngredient.ingredient.name_vi}" in "${dishIngredient.dish.name_vi}" from "${dishIngredient.unit}" to unit "${unit.symbol}"`);
        } else {
          console.log(`✗ Unit not found for symbol "${mappedSymbol}" (dish ingredient: ${dishIngredient.ingredient.name_vi} in ${dishIngredient.dish.name_vi})`);
          failedDishIngredients++;
        }
      } else {
        console.log(`✗ No mapping found for unit "${dishIngredient.unit}" (dish ingredient: ${dishIngredient.ingredient.name_vi} in ${dishIngredient.dish.name_vi})`);
        failedDishIngredients++;
      }
    }

    console.log(`\nDish ingredients: ${migratedDishIngredients} migrated, ${failedDishIngredients} failed`);

    // Summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total ingredients migrated: ${migratedIngredients}`);
    console.log(`Total ingredients failed: ${failedIngredients}`);
    console.log(`Total dish ingredients migrated: ${migratedDishIngredients}`);
    console.log(`Total dish ingredients failed: ${failedDishIngredients}`);

    // List all unmapped units for review
    if (failedIngredients > 0 || failedDishIngredients > 0) {
      console.log('\n=== Unmapped Units ===');
      const unmappedUnits = new Set<string>();
      
      for (const ingredient of ingredients) {
        if (ingredient.default_unit && !UNIT_MAPPING[ingredient.default_unit.toLowerCase().trim()]) {
          unmappedUnits.add(ingredient.default_unit);
        }
      }
      
      for (const dishIngredient of dishIngredients) {
        if (dishIngredient.unit && !UNIT_MAPPING[dishIngredient.unit.toLowerCase().trim()]) {
          unmappedUnits.add(dishIngredient.unit);
        }
      }
      
      console.log('The following units need to be added to the mapping:');
      unmappedUnits.forEach(unit => console.log(`  - "${unit}"`));
    }

    console.log('\nMigration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateUnits();