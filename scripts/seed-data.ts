import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@exploro.com" },
    update: {},
    create: {
      email: "admin@exploro.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
      language_preference: "vi",
    },
  });

  console.log("Admin user created:", adminUser.email);

  // Create some ingredients
  const ingredients = [
    { name_vi: "Thịt ba chỉ", name_en: "Pork belly", category: "meat", default_unit: "kg", current_price: 120000 },
    { name_vi: "Gà ta", name_en: "Free-range chicken", category: "meat", default_unit: "kg", current_price: 150000 },
    { name_vi: "Cá basa", name_en: "Basa fish", category: "seafood", default_unit: "kg", current_price: 80000 },
    { name_vi: "Tôm sú", name_en: "Black tiger shrimp", category: "seafood", default_unit: "kg", current_price: 200000 },
    { name_vi: "Rau muống", name_en: "Water spinach", category: "vegetables", default_unit: "bó", current_price: 5000 },
    { name_vi: "Cải xanh", name_en: "Bok choy", category: "vegetables", default_unit: "kg", current_price: 15000 },
    { name_vi: "Hành tím", name_en: "Shallot", category: "vegetables", default_unit: "kg", current_price: 30000 },
    { name_vi: "Tỏi", name_en: "Garlic", category: "spices", default_unit: "kg", current_price: 40000 },
    { name_vi: "Gừng", name_en: "Ginger", category: "spices", default_unit: "kg", current_price: 35000 },
    { name_vi: "Nước mắm", name_en: "Fish sauce", category: "sauces", default_unit: "ml", current_price: 50 },
    { name_vi: "Dầu ăn", name_en: "Cooking oil", category: "other", default_unit: "l", current_price: 40000 },
    { name_vi: "Gạo tẻ", name_en: "White rice", category: "grains", default_unit: "kg", current_price: 25000 },
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
    { name_vi: "Món chiên", name_en: "Fried", category: "cooking_method" },
    { name_vi: "Món xào", name_en: "Stir-fried", category: "cooking_method" },
    { name_vi: "Món nướng", name_en: "Grilled", category: "cooking_method" },
    { name_vi: "Món hấp", name_en: "Steamed", category: "cooking_method" },
    { name_vi: "Món canh", name_en: "Soup", category: "meal_type" },
    { name_vi: "Món chính", name_en: "Main dish", category: "meal_type" },
    { name_vi: "Món khai vị", name_en: "Appetizer", category: "meal_type" },
    { name_vi: "Miền Bắc", name_en: "Northern", category: "cuisine" },
    { name_vi: "Miền Nam", name_en: "Southern", category: "cuisine" },
    { name_vi: "Miền Trung", name_en: "Central", category: "cuisine" },
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

  // Create some sample dishes
  const dishes = [
    {
      name_vi: "Thịt kho tàu",
      name_en: "Caramelized pork belly",
      description_vi: "Món thịt kho truyền thống với nước dừa",
      description_en: "Traditional braised pork with coconut water",
      instructions_vi: "1. Thái thịt thành miếng vừa ăn\n2. Ướp thịt với nước mắm và tiêu\n3. Làm nước màu\n4. Kho thịt với nước dừa trong 1 tiếng",
      instructions_en: "1. Cut pork into bite-sized pieces\n2. Marinate with fish sauce and pepper\n3. Make caramel sauce\n4. Braise with coconut water for 1 hour",
      difficulty: "medium",
      cook_time: 60,
      prep_time: 20,
      servings: 4,
      status: "active",
      ingredients: [
        { name: "Thịt ba chỉ", quantity: 0.5, unit: "kg" },
        { name: "Nước mắm", quantity: 50, unit: "ml" },
        { name: "Hành tím", quantity: 0.05, unit: "kg" },
      ],
      tags: ["Món chính", "Miền Nam"],
    },
    {
      name_vi: "Rau muống xào tỏi",
      name_en: "Stir-fried water spinach with garlic",
      description_vi: "Món rau xào đơn giản, thơm ngon",
      description_en: "Simple and delicious stir-fried vegetables",
      instructions_vi: "1. Nhặt rau muống, rửa sạch\n2. Băm tỏi\n3. Phi thơm tỏi\n4. Xào rau muống với lửa lớn",
      instructions_en: "1. Clean water spinach\n2. Mince garlic\n3. Sauté garlic\n4. Stir-fry water spinach on high heat",
      difficulty: "easy",
      cook_time: 10,
      prep_time: 5,
      servings: 4,
      status: "active",
      ingredients: [
        { name: "Rau muống", quantity: 2, unit: "bó" },
        { name: "Tỏi", quantity: 0.02, unit: "kg" },
        { name: "Dầu ăn", quantity: 0.05, unit: "l" },
      ],
      tags: ["Món xào"],
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
          unit: ing.unit,
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

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });