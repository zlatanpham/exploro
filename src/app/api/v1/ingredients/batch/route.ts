import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, parseJsonBody } from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/server/db";
import { z } from "zod";

// Schema for batch creating ingredients
const batchCreateIngredientsSchema = z.object({
  ingredients: z
    .array(
      z.object({
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
    )
    .min(1, "At least one ingredient is required")
    .max(50, "Maximum 50 ingredients per batch"),
});

// POST /api/v1/ingredients/batch - Batch create ingredients
export const POST = withApiAuth(
  async (request, context) => {
    const body = await parseJsonBody(request, (data) =>
      batchCreateIngredientsSchema.parse(data),
    );

    const { ingredients } = body;

    // Check for duplicates within the batch
    const nameViList = ingredients.map((i) => i.name_vi.toLowerCase());
    const uniqueNames = new Set(nameViList);

    if (uniqueNames.size !== nameViList.length) {
      // Find duplicates within batch
      const duplicatesInBatch = nameViList.filter(
        (name, index) => nameViList.indexOf(name) !== index,
      );

      throw new ApiError("VALIDATION_ERROR", {
        message: "Duplicate ingredient names found within the batch",
        duplicates: [...new Set(duplicatesInBatch)],
      });
    }

    // Check for existing ingredients in database
    const existingIngredients = await db.ingredient.findMany({
      where: {
        name_vi: {
          in: ingredients.map((i) => i.name_vi),
          mode: "insensitive",
        },
      },
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
      },
    });

    const existingNameMap = new Map(
      existingIngredients.map((i) => [i.name_vi.toLowerCase(), i]),
    );

    // Process each ingredient
    const results: any[] = [];
    const toCreate: any[] = [];
    const errors: any[] = [];

    for (const ingredient of ingredients) {
      const existing = existingNameMap.get(ingredient.name_vi.toLowerCase());

      if (existing) {
        results.push({
          success: true,
          created: false,
          ingredient: {
            ...existing,
            current_price: existing.current_price.toNumber(),
            density: existing.density?.toNumber(),
          },
          message: "Ingredient already exists",
        });
      } else {
        toCreate.push(ingredient);
      }
    }

    // Create new ingredients in a transaction
    if (toCreate.length > 0) {
      try {
        await db.$transaction(async (tx) => {
          for (const ingredientData of toCreate) {
            const newIngredient = await tx.ingredient.create({
              data: ingredientData,
            });

            // Create initial price history
            await tx.priceHistory.create({
              data: {
                ingredient_id: newIngredient.id,
                price: newIngredient.current_price,
                unit_id: newIngredient.unit_id,
              },
            });

            results.push({
              success: true,
              created: true,
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
              },
            });
          }
        });
      } catch (error) {
        // If transaction fails, mark all remaining as errors
        for (const ingredientData of toCreate) {
          if (
            !results.find(
              (r) => r.ingredient?.name_vi === ingredientData.name_vi,
            )
          ) {
            errors.push({
              success: false,
              created: false,
              ingredient_name: ingredientData.name_vi,
              error: "Failed to create ingredient due to transaction error",
            });
          }
        }
      }
    }

    // Combine errors with results
    const allResults = [...results, ...errors];

    const summary = {
      total: ingredients.length,
      created: allResults.filter((r) => r.created).length,
      existing: allResults.filter((r) => r.success && !r.created).length,
      failed: allResults.filter((r) => !r.success).length,
    };

    return NextResponse.json(
      {
        summary,
        results: allResults,
      },
      { status: 207 }, // 207 Multi-Status
    );
  },
  { requiredPermission: "write", rateLimitConfig: "bulk" },
);
