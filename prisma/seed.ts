import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUnits() {
  console.log('Seeding units...');

  // Create unit categories
  const massCategory = await prisma.unitCategory.upsert({
    where: { name: 'mass' },
    update: {},
    create: {
      name: 'mass',
      description: 'Units for measuring weight/mass',
    },
  });

  const volumeCategory = await prisma.unitCategory.upsert({
    where: { name: 'volume' },
    update: {},
    create: {
      name: 'volume',
      description: 'Units for measuring volume',
    },
  });

  const countCategory = await prisma.unitCategory.upsert({
    where: { name: 'count' },
    update: {},
    create: {
      name: 'count',
      description: 'Units for counting items',
    },
  });

  // Create mass units
  const kg = await prisma.unit.upsert({
    where: { symbol: 'kg' },
    update: {},
    create: {
      category_id: massCategory.id,
      symbol: 'kg',
      name_vi: 'kilogram',
      name_en: 'kilogram',
      plural_vi: 'kilogram',
      plural_en: 'kilograms',
      is_base_unit: true,
      factor_to_base: 1,
    },
  });

  const g = await prisma.unit.upsert({
    where: { symbol: 'g' },
    update: {},
    create: {
      category_id: massCategory.id,
      symbol: 'g',
      name_vi: 'gram',
      name_en: 'gram',
      plural_vi: 'gram',
      plural_en: 'grams',
      is_base_unit: false,
      factor_to_base: 0.001,
    },
  });

  const mg = await prisma.unit.upsert({
    where: { symbol: 'mg' },
    update: {},
    create: {
      category_id: massCategory.id,
      symbol: 'mg',
      name_vi: 'miligram',
      name_en: 'milligram',
      plural_vi: 'miligram',
      plural_en: 'milligrams',
      is_base_unit: false,
      factor_to_base: 0.000001,
    },
  });

  const ton = await prisma.unit.upsert({
    where: { symbol: 'tấn' },
    update: {},
    create: {
      category_id: massCategory.id,
      symbol: 'tấn',
      name_vi: 'tấn',
      name_en: 'ton',
      plural_vi: 'tấn',
      plural_en: 'tons',
      is_base_unit: false,
      factor_to_base: 1000,
    },
  });

  // Create volume units
  const l = await prisma.unit.upsert({
    where: { symbol: 'l' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'l',
      name_vi: 'lít',
      name_en: 'liter',
      plural_vi: 'lít',
      plural_en: 'liters',
      is_base_unit: true,
      factor_to_base: 1,
    },
  });

  const ml = await prisma.unit.upsert({
    where: { symbol: 'ml' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'ml',
      name_vi: 'mililít',
      name_en: 'milliliter',
      plural_vi: 'mililít',
      plural_en: 'milliliters',
      is_base_unit: false,
      factor_to_base: 0.001,
    },
  });

  const tbsp = await prisma.unit.upsert({
    where: { symbol: 'thìa' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'thìa',
      name_vi: 'thìa canh',
      name_en: 'tablespoon',
      plural_vi: 'thìa canh',
      plural_en: 'tablespoons',
      is_base_unit: false,
      factor_to_base: 0.015, // 15ml
    },
  });

  const tsp = await prisma.unit.upsert({
    where: { symbol: 'thìa nhỏ' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'thìa nhỏ',
      name_vi: 'thìa cà phê',
      name_en: 'teaspoon',
      plural_vi: 'thìa cà phê',
      plural_en: 'teaspoons',
      is_base_unit: false,
      factor_to_base: 0.005, // 5ml
    },
  });

  const cup = await prisma.unit.upsert({
    where: { symbol: 'chén' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'chén',
      name_vi: 'chén',
      name_en: 'cup',
      plural_vi: 'chén',
      plural_en: 'cups',
      is_base_unit: false,
      factor_to_base: 0.25, // 250ml
    },
  });

  const pinch = await prisma.unit.upsert({
    where: { symbol: 'chút' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'chút',
      name_vi: 'chút',
      name_en: 'pinch',
      plural_vi: 'chút',
      plural_en: 'pinches',
      is_base_unit: false,
      factor_to_base: 0.0003, // ~0.3ml
    },
  });

  const bowl = await prisma.unit.upsert({
    where: { symbol: 'bát' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'bát',
      name_vi: 'bát',
      name_en: 'bowl',
      plural_vi: 'bát',
      plural_en: 'bowls',
      is_base_unit: false,
      factor_to_base: 0.5, // ~500ml
    },
  });

  const largeBowl = await prisma.unit.upsert({
    where: { symbol: 'tô' },
    update: {},
    create: {
      category_id: volumeCategory.id,
      symbol: 'tô',
      name_vi: 'tô',
      name_en: 'large bowl',
      plural_vi: 'tô',
      plural_en: 'large bowls',
      is_base_unit: false,
      factor_to_base: 0.75, // ~750ml
    },
  });

  // Create count units
  const piece = await prisma.unit.upsert({
    where: { symbol: 'cái' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'cái',
      name_vi: 'cái',
      name_en: 'piece',
      plural_vi: 'cái',
      plural_en: 'pieces',
      is_base_unit: true,
      factor_to_base: 1,
    },
  });

  const fruit = await prisma.unit.upsert({
    where: { symbol: 'quả' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'quả',
      name_vi: 'quả',
      name_en: 'fruit',
      plural_vi: 'quả',
      plural_en: 'fruits',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const bunch = await prisma.unit.upsert({
    where: { symbol: 'bó' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'bó',
      name_vi: 'bó',
      name_en: 'bunch',
      plural_vi: 'bó',
      plural_en: 'bunches',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const handful = await prisma.unit.upsert({
    where: { symbol: 'nắm' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'nắm',
      name_vi: 'nắm',
      name_en: 'handful',
      plural_vi: 'nắm',
      plural_en: 'handfuls',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const pack = await prisma.unit.upsert({
    where: { symbol: 'gói' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'gói',
      name_vi: 'gói',
      name_en: 'pack',
      plural_vi: 'gói',
      plural_en: 'packs',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const box = await prisma.unit.upsert({
    where: { symbol: 'hộp' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'hộp',
      name_vi: 'hộp',
      name_en: 'box',
      plural_vi: 'hộp',
      plural_en: 'boxes',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const bottle = await prisma.unit.upsert({
    where: { symbol: 'chai' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'chai',
      name_vi: 'chai',
      name_en: 'bottle',
      plural_vi: 'chai',
      plural_en: 'bottles',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const can = await prisma.unit.upsert({
    where: { symbol: 'lon' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'lon',
      name_vi: 'lon',
      name_en: 'can',
      plural_vi: 'lon',
      plural_en: 'cans',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const clove = await prisma.unit.upsert({
    where: { symbol: 'tép' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'tép',
      name_vi: 'tép',
      name_en: 'clove',
      plural_vi: 'tép',
      plural_en: 'cloves',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const leaf = await prisma.unit.upsert({
    where: { symbol: 'lá' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'lá',
      name_vi: 'lá',
      name_en: 'leaf',
      plural_vi: 'lá',
      plural_en: 'leaves',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const stalk = await prisma.unit.upsert({
    where: { symbol: 'cọng' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'cọng',
      name_vi: 'cọng',
      name_en: 'stalk',
      plural_vi: 'cọng',
      plural_en: 'stalks',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const slice = await prisma.unit.upsert({
    where: { symbol: 'lát' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'lát',
      name_vi: 'lát',
      name_en: 'slice',
      plural_vi: 'lát',
      plural_en: 'slices',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const drop = await prisma.unit.upsert({
    where: { symbol: 'giọt' },
    update: {},
    create: {
      category_id: countCategory.id,
      symbol: 'giọt',
      name_vi: 'giọt',
      name_en: 'drop',
      plural_vi: 'giọt',
      plural_en: 'drops',
      is_base_unit: false,
      factor_to_base: 1,
    },
  });

  const spoon = await prisma.unit.upsert({
    where: { symbol: 'muỗng' },
    update: {},
    create: {
      category_id: massCategory.id,
      symbol: 'muỗng',
      name_vi: 'muỗng',
      name_en: 'spoon',
      plural_vi: 'muỗng',
      plural_en: 'spoons',
      is_base_unit: false,
      factor_to_base: 0.015, // 15g = 0.015kg
    },
  });

  // Delete existing conversions first to avoid duplicates
  console.log('Clearing existing unit conversions...');
  await prisma.unitConversion.deleteMany({});

  // Create unit conversions for mass
  await prisma.unitConversion.createMany({
    data: [
      { from_unit_id: kg.id, to_unit_id: g.id, factor: 1000, is_direct: true },
      { from_unit_id: g.id, to_unit_id: kg.id, factor: 0.001, is_direct: true },
      { from_unit_id: kg.id, to_unit_id: mg.id, factor: 1000000, is_direct: true },
      { from_unit_id: mg.id, to_unit_id: kg.id, factor: 0.000001, is_direct: true },
      { from_unit_id: g.id, to_unit_id: mg.id, factor: 1000, is_direct: true },
      { from_unit_id: mg.id, to_unit_id: g.id, factor: 0.001, is_direct: true },
      { from_unit_id: ton.id, to_unit_id: kg.id, factor: 1000, is_direct: true },
      { from_unit_id: kg.id, to_unit_id: ton.id, factor: 0.001, is_direct: true },
    ],
  });

  // Create unit conversions for volume
  await prisma.unitConversion.createMany({
    data: [
      { from_unit_id: l.id, to_unit_id: ml.id, factor: 1000, is_direct: true },
      { from_unit_id: ml.id, to_unit_id: l.id, factor: 0.001, is_direct: true },
      { from_unit_id: l.id, to_unit_id: tbsp.id, factor: 66.667, is_direct: true },
      { from_unit_id: tbsp.id, to_unit_id: l.id, factor: 0.015, is_direct: true },
      { from_unit_id: l.id, to_unit_id: tsp.id, factor: 200, is_direct: true },
      { from_unit_id: tsp.id, to_unit_id: l.id, factor: 0.005, is_direct: true },
      { from_unit_id: l.id, to_unit_id: cup.id, factor: 4, is_direct: true },
      { from_unit_id: cup.id, to_unit_id: l.id, factor: 0.25, is_direct: true },
      { from_unit_id: ml.id, to_unit_id: tbsp.id, factor: 0.0667, is_direct: true },
      { from_unit_id: tbsp.id, to_unit_id: ml.id, factor: 15, is_direct: true },
      { from_unit_id: ml.id, to_unit_id: tsp.id, factor: 0.2, is_direct: true },
      { from_unit_id: tsp.id, to_unit_id: ml.id, factor: 5, is_direct: true },
      { from_unit_id: tbsp.id, to_unit_id: tsp.id, factor: 3, is_direct: true },
      { from_unit_id: tsp.id, to_unit_id: tbsp.id, factor: 0.333, is_direct: true },
      { from_unit_id: cup.id, to_unit_id: ml.id, factor: 250, is_direct: true },
      { from_unit_id: ml.id, to_unit_id: cup.id, factor: 0.004, is_direct: true },
      { from_unit_id: cup.id, to_unit_id: tbsp.id, factor: 16.667, is_direct: true },
      { from_unit_id: tbsp.id, to_unit_id: cup.id, factor: 0.06, is_direct: true },
      { from_unit_id: tsp.id, to_unit_id: pinch.id, factor: 16.667, is_direct: true },
      { from_unit_id: pinch.id, to_unit_id: tsp.id, factor: 0.06, is_direct: true },
      { from_unit_id: bowl.id, to_unit_id: ml.id, factor: 500, is_direct: true },
      { from_unit_id: ml.id, to_unit_id: bowl.id, factor: 0.002, is_direct: true },
      { from_unit_id: largeBowl.id, to_unit_id: ml.id, factor: 750, is_direct: true },
      { from_unit_id: ml.id, to_unit_id: largeBowl.id, factor: 0.00133, is_direct: true },
      { from_unit_id: largeBowl.id, to_unit_id: bowl.id, factor: 1.5, is_direct: true },
      { from_unit_id: bowl.id, to_unit_id: largeBowl.id, factor: 0.667, is_direct: true },
      { from_unit_id: l.id, to_unit_id: bowl.id, factor: 2, is_direct: true },
      { from_unit_id: bowl.id, to_unit_id: l.id, factor: 0.5, is_direct: true },
      { from_unit_id: l.id, to_unit_id: largeBowl.id, factor: 1.333, is_direct: true },
      { from_unit_id: largeBowl.id, to_unit_id: l.id, factor: 0.75, is_direct: true },
      // Spoon (mass) conversions to other mass units
      { from_unit_id: spoon.id, to_unit_id: g.id, factor: 15, is_direct: true },
      { from_unit_id: g.id, to_unit_id: spoon.id, factor: 0.0667, is_direct: true },
      { from_unit_id: spoon.id, to_unit_id: kg.id, factor: 0.015, is_direct: true },
      { from_unit_id: kg.id, to_unit_id: spoon.id, factor: 66.667, is_direct: true },
    ],
  });

  console.log('Units seeded successfully!');

  // Return unit references for use in other seeding functions
  return {
    kg, g, mg, ton,
    l, ml, tbsp, tsp, cup, pinch, bowl, largeBowl,
    piece, fruit, bunch, handful, pack, box, bottle, can, clove, leaf, stalk, slice, drop, spoon
  };
}

async function seedData(units: any) {
  console.log('Seeding application data...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@exploro.com' },
    update: {},
    create: {
      email: 'admin@exploro.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      language_preference: 'vi',
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create some ingredients with proper unit references
  const ingredients = [
    { name_vi: 'Thịt ba chỉ', name_en: 'Pork belly', category: 'meat', unit_id: units.kg.id, current_price: 120000 },
    { name_vi: 'Gà ta', name_en: 'Free-range chicken', category: 'meat', unit_id: units.kg.id, current_price: 150000 },
    { name_vi: 'Cá basa', name_en: 'Basa fish', category: 'seafood', unit_id: units.kg.id, current_price: 80000 },
    { name_vi: 'Tôm sú', name_en: 'Black tiger shrimp', category: 'seafood', unit_id: units.kg.id, current_price: 200000 },
    { name_vi: 'Rau muống', name_en: 'Water spinach', category: 'vegetables', unit_id: units.bunch.id, current_price: 5000 },
    { name_vi: 'Cải xanh', name_en: 'Bok choy', category: 'vegetables', unit_id: units.kg.id, current_price: 15000 },
    { name_vi: 'Hành tím', name_en: 'Shallot', category: 'vegetables', unit_id: units.kg.id, current_price: 30000 },
    { name_vi: 'Tỏi', name_en: 'Garlic', category: 'spices', unit_id: units.kg.id, current_price: 40000 },
    { name_vi: 'Gừng', name_en: 'Ginger', category: 'spices', unit_id: units.kg.id, current_price: 35000 },
    { name_vi: 'Nước mắm', name_en: 'Fish sauce', category: 'sauces', unit_id: units.ml.id, current_price: 50 },
    { name_vi: 'Dầu ăn', name_en: 'Cooking oil', category: 'other', unit_id: units.l.id, current_price: 40000 },
    { name_vi: 'Gạo tẻ', name_en: 'White rice', category: 'grains', unit_id: units.kg.id, current_price: 25000 },
  ];

  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { name_vi: ing.name_vi },
      update: {},
      create: ing,
    });
  }

  console.log(`Created ${ingredients.length} ingredients`);

  // Create some tags
  const tags = [
    { name_vi: 'Món chiên', name_en: 'Fried', category: 'cooking_method' },
    { name_vi: 'Món xào', name_en: 'Stir-fried', category: 'cooking_method' },
    { name_vi: 'Món nướng', name_en: 'Grilled', category: 'cooking_method' },
    { name_vi: 'Món hấp', name_en: 'Steamed', category: 'cooking_method' },
    { name_vi: 'Món canh', name_en: 'Soup', category: 'meal_type' },
    { name_vi: 'Món chính', name_en: 'Main dish', category: 'meal_type' },
    { name_vi: 'Món khai vị', name_en: 'Appetizer', category: 'meal_type' },
    { name_vi: 'Miền Bắc', name_en: 'Northern', category: 'cuisine' },
    { name_vi: 'Miền Nam', name_en: 'Southern', category: 'cuisine' },
    { name_vi: 'Miền Trung', name_en: 'Central', category: 'cuisine' },
  ];

  const createdTags: any[] = [];
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { name_vi: tag.name_vi },
      update: {},
      create: tag,
    });
    createdTags.push(created);
  }

  console.log(`Created ${tags.length} tags`);

  // Create some sample dishes with proper unit references
  const dishes = [
    {
      name_vi: 'Thịt kho tàu',
      name_en: 'Caramelized pork belly',
      description_vi: 'Món thịt kho truyền thống với nước dừa',
      description_en: 'Traditional braised pork with coconut water',
      instructions_vi: '1. Thái thịt thành miếng vừa ăn\n2. Ướp thịt với nước mắm và tiêu\n3. Làm nước màu\n4. Kho thịt với nước dừa trong 1 tiếng',
      instructions_en: '1. Cut pork into bite-sized pieces\n2. Marinate with fish sauce and pepper\n3. Make caramel sauce\n4. Braise with coconut water for 1 hour',
      difficulty: 'medium',
      cook_time: 60,
      prep_time: 20,
      servings: 4,
      status: 'active',
      ingredients: [
        { name: 'Thịt ba chỉ', quantity: 0.5, unit_id: units.kg.id },
        { name: 'Nước mắm', quantity: 50, unit_id: units.ml.id },
        { name: 'Hành tím', quantity: 0.05, unit_id: units.kg.id },
      ],
      tags: ['Món chính', 'Miền Nam'],
    },
    {
      name_vi: 'Rau muống xào tỏi',
      name_en: 'Stir-fried water spinach with garlic',
      description_vi: 'Món rau xào đơn giản, thơm ngon',
      description_en: 'Simple and delicious stir-fried vegetables',
      instructions_vi: '1. Nhặt rau muống, rửa sạch\n2. Băm tỏi\n3. Phi thơm tỏi\n4. Xào rau muống với lửa lớn',
      instructions_en: '1. Clean water spinach\n2. Mince garlic\n3. Sauté garlic\n4. Stir-fry water spinach on high heat',
      difficulty: 'easy',
      cook_time: 10,
      prep_time: 5,
      servings: 4,
      status: 'active',
      ingredients: [
        { name: 'Rau muống', quantity: 2, unit_id: units.bunch.id },
        { name: 'Tỏi', quantity: 0.02, unit_id: units.kg.id },
        { name: 'Dầu ăn', quantity: 0.05, unit_id: units.l.id },
      ],
      tags: ['Món xào'],
    },
  ];

  for (const dishData of dishes) {
    // Find ingredient IDs
    const ingredientIds = await Promise.all(
      dishData.ingredients.map(async (ing) => {
        const ingredient = await prisma.ingredient.findFirst({
          where: { name_vi: ing.name },
        });
        return {
          ingredient_id: ingredient!.id,
          quantity: ing.quantity,
          unit_id: ing.unit_id,
        };
      })
    );

    // Find tag IDs
    const tagIds = await Promise.all(
      dishData.tags.map(async (tagName) => {
        const tag = createdTags.find((t) => t.name_vi === tagName);
        return tag!.id;
      })
    );

    const { ingredients, tags, ...dishInfo } = dishData;

    await prisma.dish.create({
      data: {
        ...dishInfo,
        DishIngredient: {
          create: ingredientIds,
        },
        DishTag: {
          create: tagIds.map((tagId) => ({ tag_id: tagId })),
        },
      },
    });
  }

  console.log(`Created ${dishes.length} dishes`);
}

async function main() {
  console.log('Starting comprehensive seed...');

  // First seed units and get references
  const units = await seedUnits();
  
  // Then seed application data with proper unit references
  await seedData(units);

  console.log('Comprehensive seed completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });