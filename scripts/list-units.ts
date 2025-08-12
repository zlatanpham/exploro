import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUnits() {
  const categories = await prisma.unitCategory.findMany({
    include: {
      units: {
        orderBy: { symbol: 'asc' }
      }
    }
  });

  for (const category of categories) {
    console.log(`\n${category.name.toUpperCase()} (${category.units.length} units):`);
    console.log('─'.repeat(50));
    
    for (const unit of category.units) {
      console.log(`  ${unit.symbol.padEnd(12)} ${unit.name_vi.padEnd(20)} (${unit.name_en})`);
    }
  }

  const totalUnits = await prisma.unit.count();
  const totalConversions = await prisma.unitConversion.count();
  
  console.log('\n' + '═'.repeat(50));
  console.log(`Total units: ${totalUnits}`);
  console.log(`Total conversions: ${totalConversions}`);
}

listUnits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());