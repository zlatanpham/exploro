import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, parseJsonBody } from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/server/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for updating ingredient
const updateIngredientSchema = z.object({
  ingredient: z.object({
    name_vi: z.string().min(1).max(255).optional(),
    name_en: z.string().max(255).nullable().optional(),
    category: z.string().min(1).max(100).optional(), // legacy support
    category_id: z.string().optional(), // new foreign key approach
    default_unit: z.string().max(50).optional(), // legacy support
    unit_id: z.string().optional(), // new foreign key approach
    current_price: z.number().positive().optional(),
    density: z.number().positive().optional(), // for mass-volume conversions
    seasonal_flag: z.boolean().optional(),
  }),
});

// GET /api/v1/ingredients/[id] - Get single ingredient
export const GET = withApiAuth(
  async (request, context, routeParams) => {
    const { params } = routeParams as RouteParams;
    const { id } = await params;

    const ingredient = await db.ingredient.findUnique({
      where: { id },
      include: {
        PriceHistory: {
          orderBy: { recorded_at: "desc" },
          take: 10,
        },
      },
    });

    if (!ingredient) {
      throw new ApiError("INGREDIENT_NOT_FOUND");
    }

    return NextResponse.json({
      ingredient: {
        id: ingredient.id,
        name_vi: ingredient.name_vi,
        name_en: ingredient.name_en,
        category: ingredient.category,
        category_id: ingredient.category_id,
        default_unit: ingredient.default_unit,
        unit_id: ingredient.unit_id,
        current_price: ingredient.current_price.toNumber(),
        density: ingredient.density?.toNumber(),
        seasonal_flag: ingredient.seasonal_flag,
        created_at: ingredient.created_at,
        updated_at: ingredient.updated_at,
        price_history: ingredient.PriceHistory.map((ph) => ({
          price: ph.price.toNumber(),
          unit_id: ph.unit_id,
          recorded_at: ph.recorded_at,
        })),
      },
    });
  },
  { requiredPermission: "read" },
);

// PUT /api/v1/ingredients/[id] - Update ingredient
export const PUT = withApiAuth(
  async (request, context, routeParams) => {
    const { params } = routeParams as RouteParams;
    const { id } = await params;
    const body = await parseJsonBody(request, (data) =>
      updateIngredientSchema.parse(data),
    );

    const { ingredient: updateData } = body;

    // Check if ingredient exists
    const existingIngredient = await db.ingredient.findUnique({
      where: { id },
    });

    if (!existingIngredient) {
      throw new ApiError("INGREDIENT_NOT_FOUND");
    }

    // If updating name_vi, check for duplicates
    if (
      updateData.name_vi &&
      updateData.name_vi !== existingIngredient.name_vi
    ) {
      const duplicate = await db.ingredient.findFirst({
        where: {
          name_vi: {
            equals: updateData.name_vi,
            mode: "insensitive",
          },
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ApiError("DUPLICATE_INGREDIENT", {
          existing_id: duplicate.id,
          existing_name: duplicate.name_vi,
        });
      }
    }

    // Track price changes
    if (
      updateData.current_price !== undefined &&
      updateData.current_price !== existingIngredient.current_price.toNumber()
    ) {
      await db.priceHistory.create({
        data: {
          ingredient_id: id,
          price: updateData.current_price,
          unit_id: updateData.unit_id || existingIngredient.unit_id,
        },
      });
    }

    // Update ingredient
    const updatedIngredient = await db.ingredient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ingredient: {
        id: updatedIngredient.id,
        name_vi: updatedIngredient.name_vi,
        name_en: updatedIngredient.name_en,
        category: updatedIngredient.category,
        category_id: updatedIngredient.category_id,
        default_unit: updatedIngredient.default_unit,
        unit_id: updatedIngredient.unit_id,
        current_price: updatedIngredient.current_price.toNumber(),
        density: updatedIngredient.density?.toNumber(),
        seasonal_flag: updatedIngredient.seasonal_flag,
        created_at: updatedIngredient.created_at,
        updated_at: updatedIngredient.updated_at,
      },
    });
  },
  { requiredPermission: "write" },
);

// DELETE /api/v1/ingredients/[id] - Delete ingredient
export const DELETE = withApiAuth(
  async (request, context, routeParams) => {
    const { params } = routeParams as RouteParams;
    const { id } = await params;

    // Check if ingredient exists
    const ingredient = await db.ingredient.findUnique({
      where: { id },
      include: {
        DishIngredient: {
          take: 1,
        },
      },
    });

    if (!ingredient) {
      throw new ApiError("INGREDIENT_NOT_FOUND");
    }

    // Check if ingredient is used in any dishes
    if (ingredient.DishIngredient.length > 0) {
      throw new ApiError("VALIDATION_ERROR", {
        message: "Cannot delete ingredient that is used in dishes",
        dishes_count: await db.dishIngredient.count({
          where: { ingredient_id: id },
        }),
      });
    }

    // Delete ingredient (price history will be cascade deleted)
    await db.ingredient.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Ingredient deleted successfully" },
      { status: 200 },
    );
  },
  { requiredPermission: "admin" },
);
