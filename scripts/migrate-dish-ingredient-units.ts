import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDishIngredientUnits() {
  console.log('Migrating dish ingredient units from non-convertible to convertible...');

  try {
    // Get convertible units
    const gramUnit = await prisma.unit.findFirst({ where: { symbol: 'g' } });
    const mlUnit = await prisma.unit.findFirst({ where: { symbol: 'ml' } });
    
    if (!gramUnit || !mlUnit) {
      console.error('Required units (g, ml) not found. Please run unit seeding first.');
      return;
    }

    // Unit conversion mapping: non-convertible symbol -> { unit, quantity_multiplier }
    const unitMappings: Record<string, { unit_id: string, multiplier: number }> = {
      'cái': { unit_id: gramUnit.id, multiplier: 200 }, // 1 piece ≈ 200g (average)
      'quả': { unit_id: gramUnit.id, multiplier: 150 }, // 1 fruit ≈ 150g
      'bó': { unit_id: gramUnit.id, multiplier: 100 }, // 1 bunch ≈ 100g
      'nắm': { unit_id: gramUnit.id, multiplier: 30 },  // 1 handful ≈ 30g
      'gói': { unit_id: gramUnit.id, multiplier: 50 },  // 1 pack ≈ 50g
      'hộp': { unit_id: gramUnit.id, multiplier: 100 }, // 1 box ≈ 100g
      'chai': { unit_id: mlUnit.id, multiplier: 500 },  // 1 bottle ≈ 500ml
      'lon': { unit_id: mlUnit.id, multiplier: 400 },   // 1 can ≈ 400ml
      'tép': { unit_id: gramUnit.id, multiplier: 3 },   // 1 clove ≈ 3g
      'lá': { unit_id: gramUnit.id, multiplier: 1 },    // 1 leaf ≈ 1g
      'cọng': { unit_id: gramUnit.id, multiplier: 10 }, // 1 stalk ≈ 10g
      'lát': { unit_id: gramUnit.id, multiplier: 5 },   // 1 slice ≈ 5g
      'giọt': { unit_id: mlUnit.id, multiplier: 0.05 }, // 1 drop ≈ 0.05ml
      'muỗng': { unit_id: mlUnit.id, multiplier: 15 },  // 1 spoon ≈ 15ml
    };

    // Get all dish ingredients using non-convertible units
    const dishIngredients = await prisma.dishIngredient.findMany({
      where: {
        unit_ref: {
          symbol: {
            in: Object.keys(unitMappings)
          }
        }
      },
      include: {
        dish: { select: { name_vi: true } },
        ingredient: { select: { name_vi: true } },
        unit_ref: { select: { symbol: true } }
      }
    });

    console.log(`Found ${dishIngredients.length} dish ingredients to migrate`);

    let updated = 0;
    for (const dishIngredient of dishIngredients) {
      const oldSymbol = dishIngredient.unit_ref.symbol;
      const mapping = unitMappings[oldSymbol];
      
      if (mapping) {
        const newQuantity = dishIngredient.quantity.toNumber() * mapping.multiplier;
        
        await prisma.dishIngredient.update({
          where: { id: dishIngredient.id },
          data: {
            unit_id: mapping.unit_id,
            quantity: newQuantity,
            converted_quantity: newQuantity, // same as quantity for base units
            conversion_factor: 1,
          }
        });

        console.log(
          `${dishIngredient.dish.name_vi}: ${dishIngredient.ingredient.name_vi} ` +
          `${dishIngredient.quantity} ${oldSymbol} → ${newQuantity} ${mapping.unit_id === gramUnit.id ? 'g' : 'ml'}`
        );
        updated++;
      }
    }

    console.log(`Successfully migrated ${updated} dish ingredients!`);

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

migrateDishIngredientUnits()
  .catch((e) => {
    console.error("Error migrating dish ingredient units:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });