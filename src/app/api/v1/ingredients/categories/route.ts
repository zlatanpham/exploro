import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api/middleware";
import { db } from "@/server/db";

// GET /api/v1/ingredients/categories - List all ingredient categories from database
export const GET = withApiAuth(
  async (request, _context) => {
    const categories = await db.ingredientCategory.findMany({
      orderBy: { value: "asc" },
      select: {
        id: true,
        value: true,
        name_vi: true,
        name_en: true,
        description: true,
        created_at: true,
        _count: {
          select: {
            ingredients: true,
          },
        },
      },
    });

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        value: category.value,
        name_vi: category.name_vi,
        name_en: category.name_en,
        description: category.description,
        created_at: category.created_at,
        ingredients_count: category._count.ingredients,
      })),
      total: categories.length,
    });
  },
  { requiredPermission: "read" },
);