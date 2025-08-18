import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedIngredientMappings() {
  console.log('Seeding ingredient unit mappings...');

  try {
    // Get unit IDs for the mappings
    const units = await prisma.unit.findMany({
      include: { category: true },
    });

    const getUnit = (symbol: string) => {
      const unit = units.find(u => u.symbol === symbol);
      if (!unit) {
        throw new Error(`Unit not found: ${symbol}`);
      }
      return unit;
    };

    // Unit mappings - commented out unused variables
    // const gUnit = getUnit('g');
    // const mlUnit = getUnit('ml');
    // const quaUnit = getUnit('quả');
    // const chaiUnit = getUnit('chai');
    // const lonUnit = getUnit('lon');
    // const hopUnit = getUnit('hộp');
    // const boUnit = getUnit('bó');
    // const laUnit = getUnit('lá');
    // const tepUnit = getUnit('tép');

    // Common Vietnamese ingredient mappings
    const commonMappings = [
      // Eggs - Trứng
      {
        ingredient_name: 'Trứng gà',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 60, // 1 quả trứng gà ≈ 60g
      },
      {
        ingredient_name: 'Trứng vịt',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 75, // 1 quả trứng vịt ≈ 75g
      },
      {
        ingredient_name: 'Trứng cút',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 12, // 1 quả trứng cút ≈ 12g
      },

      // Vegetables - Rau củ
      {
        ingredient_name: 'Hành tây',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 150, // 1 quả hành tây ≈ 150g
      },
      {
        ingredient_name: 'Cà chua',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 120, // 1 quả cà chua ≈ 120g
      },
      {
        ingredient_name: 'Khoai tây',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 200, // 1 quả khoai tây ≈ 200g
      },
      {
        ingredient_name: 'Củ cải trắng',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 800, // 1 quả củ cải ≈ 800g
      },
      {
        ingredient_name: 'Bắp cải',
        count_unit_symbol: 'quả',
        measurable_unit_symbol: 'g',
        quantity: 1000, // 1 quả bắp cải ≈ 1kg
      },

      // Bundled vegetables - Rau bó
      {
        ingredient_name: 'Rau muống',
        count_unit_symbol: 'bó',
        measurable_unit_symbol: 'g',
        quantity: 300, // 1 bó rau muống ≈ 300g
      },
      {
        ingredient_name: 'Cải ngọt',
        count_unit_symbol: 'bó',
        measurable_unit_symbol: 'g',
        quantity: 400, // 1 bó cải ngọt ≈ 400g
      },
      {
        ingredient_name: 'Rau cần',
        count_unit_symbol: 'bó',
        measurable_unit_symbol: 'g',
        quantity: 200, // 1 bó rau cần ≈ 200g
      },

      // Garlic cloves - Tỏi
      {
        ingredient_name: 'Tỏi',
        count_unit_symbol: 'tép',
        measurable_unit_symbol: 'g',
        quantity: 4, // 1 tép tỏi ≈ 4g
      },

      // Leaves - Lá
      {
        ingredient_name: 'Lá chuối',
        count_unit_symbol: 'lá',
        measurable_unit_symbol: 'g',
        quantity: 50, // 1 lá chuối ≈ 50g
      },
      {
        ingredient_name: 'Lá lốt',
        count_unit_symbol: 'lá',
        measurable_unit_symbol: 'g',
        quantity: 2, // 1 lá lốt ≈ 2g
      },

      // Packaged goods - Hàng đóng gói
      {
        ingredient_name: 'Sữa tươi',
        count_unit_symbol: 'hộp',
        measurable_unit_symbol: 'ml',
        quantity: 1000, // 1 hộp sữa tươi ≈ 1L
      },
      {
        ingredient_name: 'Sữa đặc',
        count_unit_symbol: 'lon',
        measurable_unit_symbol: 'ml',
        quantity: 380, // 1 lon sữa đặc ≈ 380ml
      },
      {
        ingredient_name: 'Nước mắm',
        count_unit_symbol: 'chai',
        measurable_unit_symbol: 'ml',
        quantity: 500, // 1 chai nước mắm ≈ 500ml
      },
      {
        ingredient_name: 'Dầu ăn',
        count_unit_symbol: 'chai',
        measurable_unit_symbol: 'ml',
        quantity: 1000, // 1 chai dầu ăn ≈ 1L
      },
      {
        ingredient_name: 'Tương ớt',
        count_unit_symbol: 'chai',
        measurable_unit_symbol: 'ml',
        quantity: 300, // 1 chai tương ớt ≈ 300ml
      },
      {
        ingredient_name: 'Sốt mayonnaise',
        count_unit_symbol: 'chai',
        measurable_unit_symbol: 'ml',
        quantity: 450, // 1 chai mayonnaise ≈ 450ml
      },

      // Canned goods - Hàng đóng lon
      {
        ingredient_name: 'Đậu phộng',
        count_unit_symbol: 'lon',
        measurable_unit_symbol: 'g',
        quantity: 340, // 1 lon đậu phộng ≈ 340g
      },
      {
        ingredient_name: 'Cà chua nghiền',
        count_unit_symbol: 'lon',
        measurable_unit_symbol: 'ml',
        quantity: 400, // 1 lon cà chua nghiền ≈ 400ml
      },
      {
        ingredient_name: 'Nước dừa',
        count_unit_symbol: 'lon',
        measurable_unit_symbol: 'ml',
        quantity: 400, // 1 lon nước dừa ≈ 400ml
      },

      // Box packaged - Hàng đóng hộp
      {
        ingredient_name: 'Đậu hũ',
        count_unit_symbol: 'hộp',
        measurable_unit_symbol: 'g',
        quantity: 300, // 1 hộp đậu hũ ≈ 300g
      },
      {
        ingredient_name: 'Chả cá',
        count_unit_symbol: 'hộp',
        measurable_unit_symbol: 'g',
        quantity: 200, // 1 hộp chả cá ≈ 200g
      },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const mapping of commonMappings) {
      try {
        // Find the ingredient by name
        const ingredient = await prisma.ingredient.findFirst({
          where: {
            name_vi: {
              contains: mapping.ingredient_name,
              mode: 'insensitive',
            },
          },
        });

        if (!ingredient) {
          console.log(`Ingredient not found: ${mapping.ingredient_name}`);
          continue;
        }

        const countUnit = getUnit(mapping.count_unit_symbol);
        const measurableUnit = getUnit(mapping.measurable_unit_symbol);

        // Create or update the mapping
        await prisma.ingredientUnitMapping.upsert({
          where: {
            ingredient_id_count_unit_id: {
              ingredient_id: ingredient.id,
              count_unit_id: countUnit.id,
            },
          },
          update: {
            measurable_unit_id: measurableUnit.id,
            quantity: mapping.quantity,
          },
          create: {
            ingredient_id: ingredient.id,
            count_unit_id: countUnit.id,
            measurable_unit_id: measurableUnit.id,
            quantity: mapping.quantity,
          },
        });

        console.log(`✅ Created mapping: ${mapping.ingredient_name} - 1 ${mapping.count_unit_symbol} = ${mapping.quantity} ${mapping.measurable_unit_symbol}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating mapping for ${mapping.ingredient_name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Ingredient mappings seeding completed!`);
    console.log(`✅ Successfully created: ${successCount} mappings`);
    console.log(`❌ Failed: ${errorCount} mappings`);

    if (errorCount > 0) {
      console.log(`\n💡 Tips:`);
      console.log(`- Make sure the ingredients exist in your database`);
      console.log(`- Run the ingredient seeding script first if needed`);
      console.log(`- Check that all units (quả, chai, lon, hộp, bó, lá, tép) exist`);
    }

  } catch (error) {
    console.error('Error seeding ingredient mappings:', error);
    throw error;
  }
}

void seedIngredientMappings()
  .then(() => {
    console.log('Mapping seeding completed successfully');
  })
  .catch((e) => {
    console.error('Error seeding ingredient mappings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });