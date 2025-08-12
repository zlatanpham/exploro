import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api/middleware";

// Define common ingredient units with categories
const ingredientUnits = [
  // Mass units
  {
    value: "kg",
    name_vi: "Kilogram",
    name_en: "Kilogram",
    symbol: "kg",
    category: "mass",
    base_unit: true,
    factor_to_base: 1,
  },
  {
    value: "g",
    name_vi: "Gram",
    name_en: "Gram",
    symbol: "g",
    category: "mass",
    base_unit: false,
    factor_to_base: 0.001,
  },
  {
    value: "mg",
    name_vi: "Miligram",
    name_en: "Milligram",
    symbol: "mg",
    category: "mass",
    base_unit: false,
    factor_to_base: 0.000001,
  },
  {
    value: "tấn",
    name_vi: "Tấn",
    name_en: "Ton",
    symbol: "tấn",
    category: "mass",
    base_unit: false,
    factor_to_base: 1000,
  },

  // Volume units
  {
    value: "l",
    name_vi: "Lít",
    name_en: "Liter",
    symbol: "l",
    category: "volume",
    base_unit: true,
    factor_to_base: 1,
  },
  {
    value: "ml",
    name_vi: "Mililít",
    name_en: "Milliliter",
    symbol: "ml",
    category: "volume",
    base_unit: false,
    factor_to_base: 0.001,
  },
  {
    value: "cl",
    name_vi: "Centilít",
    name_en: "Centiliter",
    symbol: "cl",
    category: "volume",
    base_unit: false,
    factor_to_base: 0.01,
  },
  {
    value: "dl",
    name_vi: "Decilít",
    name_en: "Deciliter",
    symbol: "dl",
    category: "volume",
    base_unit: false,
    factor_to_base: 0.1,
  },

  // Count units
  {
    value: "cái",
    name_vi: "Cái",
    name_en: "Piece",
    symbol: "cái",
    category: "count",
    base_unit: true,
    factor_to_base: 1,
  },
  {
    value: "chiếc",
    name_vi: "Chiếc",
    name_en: "Item",
    symbol: "chiếc",
    category: "count",
    base_unit: false,
    factor_to_base: 1,
  },
  {
    value: "con",
    name_vi: "Con",
    name_en: "Animal/Fish (count)",
    symbol: "con",
    category: "count",
    base_unit: false,
    factor_to_base: 1,
  },
  {
    value: "quả",
    name_vi: "Quả",
    name_en: "Fruit/Egg (count)",
    symbol: "quả",
    category: "count",
    base_unit: false,
    factor_to_base: 1,
  },

  // Bundle units
  {
    value: "bó",
    name_vi: "Bó",
    name_en: "Bunch",
    symbol: "bó",
    category: "bundle",
    base_unit: true,
    factor_to_base: 1,
  },
  {
    value: "bụi",
    name_vi: "Bụi",
    name_en: "Bush/Clump",
    symbol: "bụi",
    category: "bundle",
    base_unit: false,
    factor_to_base: 1,
  },
  {
    value: "nải",
    name_vi: "Nải",
    name_en: "Hand (of bananas)",
    symbol: "nải",
    category: "bundle",
    base_unit: false,
    factor_to_base: 1,
  },
  {
    value: "chùm",
    name_vi: "Chùm",
    name_en: "Cluster",
    symbol: "chùm",
    category: "bundle",
    base_unit: false,
    factor_to_base: 1,
  },

  // Vietnamese cooking units
  {
    value: "muỗng canh",
    name_vi: "Muỗng canh",
    name_en: "Tablespoon",
    symbol: "muỗng canh",
    category: "cooking",
    base_unit: false,
    factor_to_base: 0.015, // ~15ml
  },
  {
    value: "muỗng cà phê",
    name_vi: "Muỗng cà phê",
    name_en: "Teaspoon",
    symbol: "muỗng cà phê",
    category: "cooking",
    base_unit: false,
    factor_to_base: 0.005, // ~5ml
  },
  {
    value: "chén",
    name_vi: "Chén",
    name_en: "Bowl",
    symbol: "chén",
    category: "cooking",
    base_unit: false,
    factor_to_base: 0.2, // ~200ml
  },
  {
    value: "bát",
    name_vi: "Bát",
    name_en: "Large bowl",
    symbol: "bát",
    category: "cooking",
    base_unit: false,
    factor_to_base: 0.3, // ~300ml
  },
];

// GET /api/v1/ingredients/units - List all ingredient units
export const GET = withApiAuth(
  async (request, context) => {
    const searchParams = new URL(request.url).searchParams;
    const category = searchParams.get("category");

    let units = ingredientUnits;

    // Filter by category if provided
    if (category) {
      units = units.filter((unit) => unit.category === category);
    }

    // Group by category if requested
    const grouped = searchParams.get("grouped") === "true";

    if (grouped) {
      const groupedUnits = units.reduce(
        (acc, unit) => {
          if (!acc[unit.category]) {
            acc[unit.category] = [];
          }
          acc[unit.category].push(unit);
          return acc;
        },
        {} as Record<string, typeof ingredientUnits>,
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
  },
  { requiredPermission: "read" },
);
