#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMuongToMass() {
  console.log('🔧 Fixing muỗng unit to be mass category...');

  try {
    // Get the mass category
    const massCategory = await prisma.unitCategory.findUnique({
      where: { name: 'mass' }
    });

    if (!massCategory) {
      console.log('❌ Mass category not found');
      return;
    }

    // Update the existing spoon unit to be in mass category
    const updatedSpoon = await prisma.unit.update({
      where: { symbol: 'muỗng' },
      data: {
        category_id: massCategory.id,
        factor_to_base: 0.015 // 15g = 0.015kg 
      },
      include: { category: true }
    });

    console.log('✅ Updated spoon unit:');
    console.log(`  Symbol: ${updatedSpoon.symbol}`);
    console.log(`  Category: ${updatedSpoon.category.name}`);
    console.log(`  Factor to base: ${updatedSpoon.factor_to_base.toString()}kg`);
    console.log(`  Equivalent: 15g per muỗng`);

    // Remove old volume conversions for muỗng
    await prisma.unitConversion.deleteMany({
      where: {
        OR: [
          { from_unit_id: updatedSpoon.id },
          { to_unit_id: updatedSpoon.id }
        ]
      }
    });

    // Get mass units for new conversions
    const [kgUnit, gUnit] = await Promise.all([
      prisma.unit.findUnique({ where: { symbol: 'kg' } }),
      prisma.unit.findUnique({ where: { symbol: 'g' } })
    ]);

    if (!kgUnit || !gUnit) {
      console.log('❌ Required mass units not found');
      return;
    }

    // Add mass conversions
    await prisma.unitConversion.createMany({
      data: [
        // Spoon to grams
        { from_unit_id: updatedSpoon.id, to_unit_id: gUnit.id, factor: 15, is_direct: true },
        { from_unit_id: gUnit.id, to_unit_id: updatedSpoon.id, factor: 0.0667, is_direct: true },
        // Spoon to kg
        { from_unit_id: updatedSpoon.id, to_unit_id: kgUnit.id, factor: 0.015, is_direct: true },
        { from_unit_id: kgUnit.id, to_unit_id: updatedSpoon.id, factor: 66.667, is_direct: true },
      ]
    });

    // Verify conversions
    const conversions = await prisma.unitConversion.findMany({
      where: { from_unit_id: updatedSpoon.id },
      include: { 
        from_unit: { select: { symbol: true } },
        to_unit: { select: { symbol: true } }
      }
    });

    console.log('\n✅ New mass conversions for muỗng:');
    conversions.forEach(conv => {
      console.log(`  ${conv.from_unit.symbol} → ${conv.to_unit.symbol}: × ${conv.factor.toString()}`);
    });

    console.log('\n✅ Muỗng unit successfully converted to mass category!');
    console.log('Now 1 muỗng = 15g, suitable for both solid and liquid ingredients');

  } catch (error) {
    console.error('❌ Failed to fix muỗng unit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMuongToMass();