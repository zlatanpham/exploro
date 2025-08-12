import { NextRequest, NextResponse } from "next/server";
import {
  withApiAuth,
  getQueryParams,
  getPaginationParams,
  parseJsonBody,
} from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/server/db";
import { z } from "zod";

// GET /api/v1/ingredients - List ingredients
export const GET = withApiAuth(
  async (request, context) => {
    const searchParams = getQueryParams(request);
    const { limit, offset } = getPaginationParams(searchParams);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const seasonal = searchParams.get("seasonal");

    // Build where clause
    const where: any = {
      // No organization filtering for ingredients - they are global
    };

    if (search) {
      where.OR = [
        { name_vi: { contains: search, mode: "insensitive" } },
        { name_en: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (seasonal !== null) {
      where.seasonal_flag = seasonal === "true";
    }

    // Get total count
    const total = await db.ingredient.count({ where });

    // Get ingredients
    const ingredients = await db.ingredient.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { name_vi: "asc" },
      select: {
        id: true,
        name_vi: true,
        name_en: true,
        category: true,
        category_id: true,
        default_unit: true,
        unit_id: true,
        current_price: true,
        density: true,
        seasonal_flag: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      ingredients: ingredients.map((ingredient) => ({
        ...ingredient,
        current_price: ingredient.current_price.toNumber(),
        density: ingredient.density?.toNumber(),
      })),
      total,
      limit,
      offset,
    });
  },
  { requiredPermission: "read" },
);

// Schema for creating ingredient
const createIngredientSchema = z.object({
  ingredient: z.object({
    name_vi: z.string().min(1, "Vietnamese name is required").max(255),
    name_en: z.string().max(255).optional(),
    category: z.string().min(1, "Category is required").max(100).optional(), // legacy support
    category_id: z.string().optional(), // new foreign key approach
    default_unit: z.string().max(50).optional(), // legacy support  
    unit_id: z.string().min(1, "Unit ID is required"), // new foreign key approach
    current_price: z.number().positive("Price must be positive"),
    density: z.number().positive().optional(), // for mass-volume conversions
    seasonal_flag: z.boolean().optional().default(false),
  }),
});

// POST /api/v1/ingredients - Create ingredient
export const POST = withApiAuth(
  async (request, context) => {
    const body = await parseJsonBody(request, (data) =>
      createIngredientSchema.parse(data),
    );

    const { ingredient: ingredientData } = body;

    // Check for duplicate ingredient by Vietnamese name
    const existingIngredient = await db.ingredient.findFirst({
      where: {
        name_vi: {
          equals: ingredientData.name_vi,
          mode: "insensitive",
        },
      },
    });

    if (existingIngredient) {
      return NextResponse.json(
        {
          duplicate_found: true,
          ingredient: {
            id: existingIngredient.id,
            name_vi: existingIngredient.name_vi,
            name_en: existingIngredient.name_en,
            category: existingIngredient.category,
            category_id: existingIngredient.category_id,
            default_unit: existingIngredient.default_unit,
            unit_id: existingIngredient.unit_id,
            current_price: existingIngredient.current_price.toNumber(),
            density: existingIngredient.density?.toNumber(),
            seasonal_flag: existingIngredient.seasonal_flag,
            created_at: existingIngredient.created_at,
            updated_at: existingIngredient.updated_at,
          },
          message: "An ingredient with this Vietnamese name already exists",
        },
        { status: 200 }, // Return 200 with duplicate info instead of error
      );
    }

    // Create new ingredient
    const newIngredient = await db.ingredient.create({
      data: ingredientData,
    });

    // Create initial price history entry
    await db.priceHistory.create({
      data: {
        ingredient_id: newIngredient.id,
        price: newIngredient.current_price,
        unit_id: newIngredient.unit_id,
      },
    });

    return NextResponse.json(
      {
        duplicate_found: false,
        ingredient: {
          id: newIngredient.id,
          name_vi: newIngredient.name_vi,
          name_en: newIngredient.name_en,
          category: newIngredient.category,
          category_id: newIngredient.category_id,
          default_unit: newIngredient.default_unit,
          unit_id: newIngredient.unit_id,
          current_price: newIngredient.current_price.toNumber(),
          density: newIngredient.density?.toNumber(),
          seasonal_flag: newIngredient.seasonal_flag,
          created_at: newIngredient.created_at,
          updated_at: newIngredient.updated_at,
        },
      },
      { status: 201 },
    );
  },
  { requiredPermission: "write" },
);
