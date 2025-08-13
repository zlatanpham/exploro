import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api/middleware";
import { db } from "@/server/db";

// GET /api/v1/ingredients/units - List all ingredient units
export const GET = withApiAuth(
  async (request, _context) => {
    try {
      const searchParams = new URL(request.url).searchParams;
      const category = searchParams.get("category");

      // Build query with category filter if provided
      const whereClause = category 
        ? { category: { name: category } }
        : {};

      // Fetch units from database with category information
      const dbUnits = await db.unit.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: [
          { category: { name: 'asc' } },
          { symbol: 'asc' }
        ]
      });

      // Transform database units to match the expected API format
      const units = dbUnits.map((unit) => ({
        id: unit.id,
        value: unit.symbol,
        name_vi: unit.name_vi,
        name_en: unit.name_en,
        symbol: unit.symbol,
        category: unit.category.name,
        base_unit: unit.is_base_unit,
        factor_to_base: Number(unit.factor_to_base),
      }));

      // Group by category if requested
      const grouped = searchParams.get("grouped") === "true";

      if (grouped) {
        const groupedUnits = units.reduce(
          (acc, unit) => {
            if (!acc[unit.category]) {
              acc[unit.category] = [];
            }
            acc[unit.category]!.push(unit);
            return acc;
          },
          {} as Record<string, typeof units>,
        );

        return NextResponse.json({
          units: groupedUnits,
          total: units.length,
          categories: Object.keys(groupedUnits),
        });
      }

      return NextResponse.json({
        units,
        total: units.length,
      });
    } catch (error) {
      console.error("Error fetching units:", error);
      return NextResponse.json(
        { error: "Failed to fetch units" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: "read" },
);
