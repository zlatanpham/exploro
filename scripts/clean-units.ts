import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanUnits() {
  console.log('Cleaning non-convertible units...');

  // List of non-convertible unit symbols to remove
  const nonConvertibleUnits = [
    'cái', 'bó', 'chai', 'cọng', 'giọt', 'gói', 'hộp', 
    'lá', 'lát', 'lon', 'nắm', 'quả', 'tép', 'muỗng'
  ];

  try {
    // Get units to be deleted
    const unitsToDelete = await prisma.unit.findMany({
      where: {
        symbol: {
          in: nonConvertibleUnits
        }
      }
    });

    console.log(`Found ${unitsToDelete.length} non-convertible units to remove:`, 
      unitsToDelete.map(u => u.symbol).join(', '));

    if (unitsToDelete.length === 0) {
      console.log('No non-convertible units found to remove.');
      return;
    }

    // Check for any ingredients using these units
    const ingredientsUsingUnits = await prisma.ingredient.findMany({
      where: {
        unit_id: {
          in: unitsToDelete.map(u => u.id)
        }
      },
      select: {
        id: true,
        name_vi: true,
        unit_id: true,
        unit: {
          select: {
            symbol: true
          }
        }
      }
    });

    if (ingredientsUsingUnits.length > 0) {
      console.log(`WARNING: Found ${ingredientsUsingUnits.length} ingredients using non-convertible units:`);
      ingredientsUsingUnits.forEach(ing => {
        console.log(`  - ${ing.name_vi} (${ing.unit.symbol})`);
      });
      console.log('Please update these ingredients to use convertible units before running this script.');
      return;
    }

    // Check for dish ingredients using these units
    const dishIngredientsUsingUnits = await prisma.dishIngredient.findMany({
      where: {
        unit_id: {
          in: unitsToDelete.map(u => u.id)
        }
      },
      select: {
        id: true,
        dish: {
          select: {
            name_vi: true
          }
        },
        ingredient: {
          select: {
            name_vi: true
          }
        },
        unit_ref: {
          select: {
            symbol: true
          }
        }
      }
    });

    if (dishIngredientsUsingUnits.length > 0) {
      console.log(`WARNING: Found ${dishIngredientsUsingUnits.length} dish ingredients using non-convertible units:`);
      dishIngredientsUsingUnits.forEach(di => {
        console.log(`  - ${di.dish.name_vi}: ${di.ingredient.name_vi} (${di.unit_ref.symbol})`);
      });
      console.log('Please update these dish ingredients to use convertible units before running this script.');
      return;
    }

    // Delete unit conversions first (due to foreign key constraints)
    const conversionsDeleted = await prisma.unitConversion.deleteMany({
      where: {
        OR: [
          {
            from_unit_id: {
              in: unitsToDelete.map(u => u.id)
            }
          },
          {
            to_unit_id: {
              in: unitsToDelete.map(u => u.id)
            }
          }
        ]
      }
    });

    console.log(`Deleted ${conversionsDeleted.count} unit conversions`);

    // Delete the units
    const unitsDeleted = await prisma.unit.deleteMany({
      where: {
        id: {
          in: unitsToDelete.map(u => u.id)
        }
      }
    });

    console.log(`Deleted ${unitsDeleted.count} non-convertible units`);

    // Delete the count category if it has no units left
    const countCategory = await prisma.unitCategory.findFirst({
      where: { name: 'count' },
      include: {
        units: true
      }
    });

    if (countCategory && countCategory.units.length === 0) {
      await prisma.unitCategory.delete({
        where: { id: countCategory.id }
      });
      console.log('Deleted empty count category');
    }

    console.log('Clean-up completed successfully!');

  } catch (error) {
    console.error('Error during clean-up:', error);
    throw error;
  }
}

cleanUnits()
  .catch((e) => {
    console.error("Error cleaning units:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });