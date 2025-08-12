import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedIngredientCategories() {
  console.log('🌱 Seeding ingredient categories...');

  const categories = [
    {
      value: 'vegetables',
      name_vi: 'Rau củ',
      name_en: 'Vegetables',
      description: 'Fresh vegetables and root vegetables',
    },
    {
      value: 'meat',
      name_vi: 'Thịt',
      name_en: 'Meat',
      description: 'All types of meat including beef, pork, chicken',
    },
    {
      value: 'seafood',
      name_vi: 'Hải sản',
      name_en: 'Seafood',
      description: 'Fish, shellfish, and other seafood',
    },
    {
      value: 'spices',
      name_vi: 'Gia vị',
      name_en: 'Spices',
      description: 'Herbs, spices, and seasonings',
    },
    {
      value: 'dairy',
      name_vi: 'Sữa và sản phẩm từ sữa',
      name_en: 'Dairy',
      description: 'Milk and dairy products',
    },
    {
      value: 'grains',
      name_vi: 'Ngũ cốc',
      name_en: 'Grains',
      description: 'Rice, wheat, and other grains',
    },
    {
      value: 'fruits',
      name_vi: 'Trái cây',
      name_en: 'Fruits',
      description: 'Fresh and dried fruits',
    },
    {
      value: 'sauces',
      name_vi: 'Nước mắm, nước chấm',
      name_en: 'Sauces',
      description: 'Fish sauce, dipping sauces, and condiments',
    },
    {
      value: 'other',
      name_vi: 'Khác',
      name_en: 'Other',
      description: 'Other ingredients not in above categories',
    },
  ];

  for (const category of categories) {
    const existing = await prisma.ingredientCategory.findUnique({
      where: { value: category.value },
    });

    if (!existing) {
      await prisma.ingredientCategory.create({
        data: category,
      });
      console.log(`✅ Created category: ${category.name_vi} (${category.value})`);
    } else {
      console.log(`⏭️ Category already exists: ${category.name_vi} (${category.value})`);
    }
  }

  console.log('✅ Ingredient categories seeded successfully!');
}

// Run if called directly
seedIngredientCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedIngredientCategories };