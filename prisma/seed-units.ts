import { PrismaClient } from '@prisma/client';

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
    ],
  });

  console.log('Units seeded successfully!');
}

seedUnits()
  .catch((e) => {
    console.error("Error seeding units:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
