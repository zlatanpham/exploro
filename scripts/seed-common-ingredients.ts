import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCommonIngredients() {
  console.log('Seeding common Vietnamese ingredients...');

  try {
    // Get unit IDs
    const units = await prisma.unit.findMany();
    const getUnit = (symbol: string) => {
      const unit = units.find(u => u.symbol === symbol);
      if (!unit) {
        throw new Error(`Unit not found: ${symbol}`);
      }
      return unit;
    };

    // Get category IDs
    const categories = await prisma.ingredientCategory.findMany();
    const getCategory = (value: string) => {
      const category = categories.find(c => c.value === value);
      if (!category) {
        // Create the category if it doesn't exist
        return prisma.ingredientCategory.create({
          data: {
            value,
            name_vi: value,
            name_en: value,
            description: `${value} category`,
          },
        });
      }
      return Promise.resolve(category);
    };

    // Unit references
    const gUnit = getUnit('g');
    const kgUnit = getUnit('kg');
    const mlUnit = getUnit('ml');
    const lUnit = getUnit('l');

    // Categories
    const proteinCategory = await getCategory('protein');
    const vegetableCategory = await getCategory('vegetables');
    const dairyCategory = await getCategory('dairy');
    const spicesCategory = await getCategory('spices');
    // const grainsCategory = await getCategory('grains');
    const saucesCategory = await getCategory('sauces');

    // Common Vietnamese ingredients with their typical pricing units
    const commonIngredients = [
      // Protein - Thịt cá
      {
        name_vi: 'Thịt heo ba chỉ',
        name_en: 'Pork belly',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 180000, // 180k VND per kg
        density: null,
      },
      {
        name_vi: 'Thịt bò thăn',
        name_en: 'Beef tenderloin',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 450000, // 450k VND per kg
        density: null,
      },
      {
        name_vi: 'Cá điêu hồng',
        name_en: 'Red tilapia',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 120000, // 120k VND per kg
        density: null,
      },
      {
        name_vi: 'Tôm sú',
        name_en: 'Tiger prawns',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 300000, // 300k VND per kg
        density: null,
      },

      // Eggs - Trứng
      {
        name_vi: 'Trứng gà',
        name_en: 'Chicken eggs',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 35000, // 35k VND per kg (about 17 eggs)
        density: null,
      },
      {
        name_vi: 'Trứng vịt',
        name_en: 'Duck eggs',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 45000, // 45k VND per kg
        density: null,
      },
      {
        name_vi: 'Trứng cút',
        name_en: 'Quail eggs',
        category_id: (await proteinCategory).id,
        unit_id: kgUnit.id,
        current_price: 80000, // 80k VND per kg
        density: null,
      },

      // Vegetables - Rau củ
      {
        name_vi: 'Hành tây',
        name_en: 'Onions',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 25000, // 25k VND per kg
        density: null,
      },
      {
        name_vi: 'Cà chua',
        name_en: 'Tomatoes',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 30000, // 30k VND per kg
        density: null,
      },
      {
        name_vi: 'Khoai tây',
        name_en: 'Potatoes',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 20000, // 20k VND per kg
        density: null,
      },
      {
        name_vi: 'Củ cải trắng',
        name_en: 'White radish',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 15000, // 15k VND per kg
        density: null,
      },
      {
        name_vi: 'Bắp cải',
        name_en: 'Cabbage',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 18000, // 18k VND per kg
        density: null,
      },
      {
        name_vi: 'Rau muống',
        name_en: 'Water spinach',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 12000, // 12k VND per kg
        density: null,
      },
      {
        name_vi: 'Cải ngọt',
        name_en: 'Bok choy',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 15000, // 15k VND per kg
        density: null,
      },
      {
        name_vi: 'Rau cần',
        name_en: 'Celery',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 40000, // 40k VND per kg
        density: null,
      },
      {
        name_vi: 'Tỏi',
        name_en: 'Garlic',
        category_id: (await spicesCategory).id,
        unit_id: kgUnit.id,
        current_price: 60000, // 60k VND per kg
        density: null,
      },

      // Leaves - Lá
      {
        name_vi: 'Lá chuối',
        name_en: 'Banana leaves',
        category_id: (await vegetableCategory).id,
        unit_id: kgUnit.id,
        current_price: 10000, // 10k VND per kg
        density: null,
      },
      {
        name_vi: 'Lá lốt',
        name_en: 'Wild betel leaves',
        category_id: (await spicesCategory).id,
        unit_id: gUnit.id,
        current_price: 80, // 80 VND per gram
        density: null,
      },

      // Dairy - Sữa
      {
        name_vi: 'Sữa tươi',
        name_en: 'Fresh milk',
        category_id: (await dairyCategory).id,
        unit_id: lUnit.id,
        current_price: 28000, // 28k VND per liter
        density: 1.03, // milk density
      },
      {
        name_vi: 'Sữa đặc',
        name_en: 'Condensed milk',
        category_id: (await dairyCategory).id,
        unit_id: mlUnit.id,
        current_price: 55, // 55 VND per ml
        density: 1.3, // condensed milk density
      },

      // Sauces and Condiments - Gia vị nước
      {
        name_vi: 'Nước mắm',
        name_en: 'Fish sauce',
        category_id: (await saucesCategory).id,
        unit_id: mlUnit.id,
        current_price: 40, // 40 VND per ml
        density: 1.05,
      },
      {
        name_vi: 'Dầu ăn',
        name_en: 'Cooking oil',
        category_id: (await saucesCategory).id,
        unit_id: lUnit.id,
        current_price: 35000, // 35k VND per liter
        density: 0.92, // cooking oil density
      },
      {
        name_vi: 'Tương ớt',
        name_en: 'Chili sauce',
        category_id: (await saucesCategory).id,
        unit_id: mlUnit.id,
        current_price: 25, // 25 VND per ml
        density: 1.1,
      },
      {
        name_vi: 'Sốt mayonnaise',
        name_en: 'Mayonnaise',
        category_id: (await saucesCategory).id,
        unit_id: mlUnit.id,
        current_price: 45, // 45 VND per ml
        density: 0.95,
      },

      // Packaged goods - Hàng đóng gói/lon
      {
        name_vi: 'Đậu phộng',
        name_en: 'Peanuts (canned)',
        category_id: (await proteinCategory).id,
        unit_id: gUnit.id,
        current_price: 50, // 50 VND per gram
        density: null,
      },
      {
        name_vi: 'Cà chua nghiền',
        name_en: 'Crushed tomatoes',
        category_id: (await saucesCategory).id,
        unit_id: mlUnit.id,
        current_price: 20, // 20 VND per ml
        density: 1.05,
      },
      {
        name_vi: 'Nước dừa',
        name_en: 'Coconut milk',
        category_id: (await dairyCategory).id,
        unit_id: mlUnit.id,
        current_price: 30, // 30 VND per ml
        density: 0.98,
      },
      {
        name_vi: 'Đậu hũ',
        name_en: 'Tofu',
        category_id: (await proteinCategory).id,
        unit_id: gUnit.id,
        current_price: 20, // 20 VND per gram
        density: null,
      },
      {
        name_vi: 'Chả cá',
        name_en: 'Fish cake',
        category_id: (await proteinCategory).id,
        unit_id: gUnit.id,
        current_price: 60, // 60 VND per gram
        density: null,
      },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const ingredient of commonIngredients) {
      try {
        await prisma.ingredient.upsert({
          where: {
            name_vi: ingredient.name_vi,
          },
          update: {
            name_en: ingredient.name_en,
            category_id: ingredient.category_id,
            unit_id: ingredient.unit_id,
            current_price: ingredient.current_price,
            density: ingredient.density,
            price_updated_at: new Date(),
          },
          create: {
            name_vi: ingredient.name_vi,
            name_en: ingredient.name_en,
            category_id: ingredient.category_id,
            unit_id: ingredient.unit_id,
            current_price: ingredient.current_price,
            density: ingredient.density,
            price_updated_at: new Date(),
          },
        });

        console.log(`✅ Created/Updated ingredient: ${ingredient.name_vi}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating ingredient ${ingredient.name_vi}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Ingredient seeding completed!`);
    console.log(`✅ Successfully processed: ${successCount} ingredients`);
    console.log(`❌ Failed: ${errorCount} ingredients`);

  } catch (error) {
    console.error('Error seeding ingredients:', error);
    throw error;
  }
}

void seedCommonIngredients()
  .then(() => {
    console.log('Seeding completed successfully');
  })
  .catch((e) => {
    console.error('Error seeding common ingredients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });