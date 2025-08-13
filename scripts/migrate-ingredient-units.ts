import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateIngredientUnits() {
  console.log('Migrating ingredient units from non-convertible to convertible...');

  try {
    // Get gram unit
    const gramUnit = await prisma.unit.findFirst({
      where: { symbol: 'g' }
    });

    if (!gramUnit) {
      console.error('Gram unit not found. Please run unit seeding first.');
      return;
    }

    // Update ingredients using 'bó' to use grams with reasonable defaults
    const ingredientUpdates = [
      { name: 'Rau muống', newUnit: gramUnit.id, newPrice: 5000 }, // ~100g bunch = 5000 VND
      { name: 'Hành lá', newUnit: gramUnit.id, newPrice: 3000 }, // ~50g bunch = 3000 VND  
      { name: 'Rau mùi', newUnit: gramUnit.id, newPrice: 2000 }, // ~30g bunch = 2000 VND
      { name: 'Lá chanh', newUnit: gramUnit.id, newPrice: 1000 }, // ~20g bunch = 1000 VND
    ];

    for (const update of ingredientUpdates) {
      const ingredient = await prisma.ingredient.findFirst({
        where: { name_vi: update.name }
      });

      if (ingredient) {
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: {
            unit_id: update.newUnit,
            current_price: update.newPrice, // price per gram
            price_updated_at: new Date(),
          }
        });
        console.log(`Updated ${update.name} to use grams (${update.newPrice} VND/g)`);
      }
    }

    console.log('Ingredient unit migration completed!');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

migrateIngredientUnits()
  .catch((e) => {
    console.error("Error migrating ingredient units:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });