#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSpoonUnit() {
  console.log('🔧 Fixing spoon unit category...');

  try {
    // Get the volume category
    const volumeCategory = await prisma.unitCategory.findUnique({
      where: { name: 'volume' }
    });

    if (!volumeCategory) {
      console.log('❌ Volume category not found');
      return;
    }

    // Update the existing spoon unit to be in volume category
    const updatedSpoon = await prisma.unit.update({
      where: { symbol: 'muỗng' },
      data: {
        category_id: volumeCategory.id,
        factor_to_base: 0.015 // 15ml equivalent
      },
      include: { category: true }
    });

    console.log('✅ Updated spoon unit:');
    console.log(`  Symbol: ${updatedSpoon.symbol}`);
    console.log(`  Category: ${updatedSpoon.category.name}`);
    console.log(`  Factor to base: ${updatedSpoon.factor_to_base.toString()}`);

    // Verify conversions exist
    const conversions = await prisma.unitConversion.findMany({
      where: { from_unit_id: updatedSpoon.id },
      include: { 
        from_unit: { select: { symbol: true } },
        to_unit: { select: { symbol: true } }
      }
    });

    console.log('\n✅ Available conversions from spoon:');
    conversions.forEach(conv => {
      console.log(`  ${conv.from_unit.symbol} → ${conv.to_unit.symbol}: × ${conv.factor.toString()}`);
    });

    console.log('\n✅ Spoon unit successfully fixed!');

  } catch (error) {
    console.error('❌ Failed to fix spoon unit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpoonUnit();