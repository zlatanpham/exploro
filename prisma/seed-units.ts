import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUnits() {
  console.log('Seeding units...');

  // Create unit categories
  const massCategory = await prisma.unitCategory.create({
    data: {
      name: 'mass',
      description: 'Units for measuring weight/mass',
    },
  });

  const volumeCategory = await prisma.unitCategory.create({
    data: {
      name: 'volume',
      description: 'Units for measuring volume',
    },
  });

  const countCategory = await prisma.unitCategory.create({
    data: {
      name: 'count',
      description: 'Units for counting items',
    },
  });

  // Create mass units
  const kg = await prisma.unit.create({
    data: {
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

  const g = await prisma.unit.create({
    data: {
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

  const mg = await prisma.unit.create({
    data: {
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

  // Create volume units
  const l = await prisma.unit.create({
    data: {
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

  const ml = await prisma.unit.create({
    data: {
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

  const tbsp = await prisma.unit.create({
    data: {
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

  const tsp = await prisma.unit.create({
    data: {
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

  const cup = await prisma.unit.create({
    data: {
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

  // Create count units
  const piece = await prisma.unit.create({
    data: {
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

  const fruit = await prisma.unit.create({
    data: {
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

  const bunch = await prisma.unit.create({
    data: {
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

  const handful = await prisma.unit.create({
    data: {
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

  const pack = await prisma.unit.create({
    data: {
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

  const box = await prisma.unit.create({
    data: {
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

  // Create unit conversions for mass
  await prisma.unitConversion.createMany({
    data: [
      { from_unit_id: kg.id, to_unit_id: g.id, factor: 1000, is_direct: true },
      { from_unit_id: g.id, to_unit_id: kg.id, factor: 0.001, is_direct: true },
      { from_unit_id: kg.id, to_unit_id: mg.id, factor: 1000000, is_direct: true },
      { from_unit_id: mg.id, to_unit_id: kg.id, factor: 0.000001, is_direct: true },
      { from_unit_id: g.id, to_unit_id: mg.id, factor: 1000, is_direct: true },
      { from_unit_id: mg.id, to_unit_id: g.id, factor: 0.001, is_direct: true },
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
    ],
  });

  console.log('Units seeded successfully!');
}

seedUnits()
  .catch((e) => {
    console.error('Error seeding units:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });