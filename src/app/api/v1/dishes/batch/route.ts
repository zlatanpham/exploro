import { NextResponse } from "next/server";
import { withApiAuth, parseJsonBody } from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/server/db";
import { z } from "zod";

// Schema for batch creating dishes
const batchCreateDishesSchema = z.object({
  dishes: z
    .array(
      z.object({
        name_vi: z.string().min(1, "Vietnamese name is required").max(255),
        name_en: z.string().max(255).optional(),
        description_vi: z.string().min(1, "Vietnamese description is required"),
        description_en: z.string().optional(),
        instructions_vi: z
          .string()
          .min(1, "Vietnamese instructions are required"),
        instructions_en: z.string().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        cook_time: z.number().int().positive("Cook time must be positive"),
        prep_time: z.number().int().nonnegative().default(0),
        servings: z.number().int().positive().default(4),
        image_url: z.string().url().optional(),
        source_url: z.string().url().optional(),
        status: z.enum(["active", "inactive"]).default("active"),
        ingredients: z.array(
          z.object({
            ingredient_id: z.string(),
            quantity: z.number().positive(),
            unit_id: z.string().min(1, "Unit ID is required").optional(),
            optional: z.boolean().default(false),
            notes: z.string().optional(),
          }),
        ),
        tags: z.array(z.string()).optional(),
      }),
    )
    .min(1, "At least one dish is required")
    .max(20, "Maximum 20 dishes per batch"),
});

// POST /api/v1/dishes/batch - Batch create dishes
export const POST = withApiAuth(
  async (request, _context) => {
    const body = await parseJsonBody(request, (data) =>
      batchCreateDishesSchema.parse(data),
    );

    const { dishes } = body;

    // Collect all unique ingredient and tag IDs
    const allIngredientIds = new Set<string>();
    const allTagIds = new Set<string>();

    dishes.forEach((dish) => {
      dish.ingredients.forEach((ing) =>
        allIngredientIds.add(ing.ingredient_id),
      );
      dish.tags?.forEach((tag) => allTagIds.add(tag));
    });

    // Validate all ingredients exist
    const existingIngredients = await db.ingredient.findMany({
      where: { id: { in: Array.from(allIngredientIds) } },
      select: { id: true },
    });

    if (existingIngredients.length !== allIngredientIds.size) {
      const foundIds = new Set(existingIngredients.map((i) => i.id));
      const missingIds = Array.from(allIngredientIds).filter(
        (id) => !foundIds.has(id),
      );

      throw new ApiError("VALIDATION_ERROR", {
        message: "Some ingredients were not found",
        missing_ingredient_ids: missingIds,
      });
    }

    // Validate all tags exist if any
    if (allTagIds.size > 0) {
      const existingTags = await db.tag.findMany({
        where: { id: { in: Array.from(allTagIds) } },
        select: { id: true },
      });

      if (existingTags.length !== allTagIds.size) {
        const foundIds = new Set(existingTags.map((t) => t.id));
        const missingIds = Array.from(allTagIds).filter(
          (id) => !foundIds.has(id),
        );

        throw new ApiError("VALIDATION_ERROR", {
          message: "Some tags were not found",
          missing_tag_ids: missingIds,
        });
      }
    }

    // Process each dish
    const results = [];

    for (const dishData of dishes) {
      try {
        const { ingredients, tags, ...dishInfo } = dishData;

        const newDish = await db.dish.create({
          data: {
            ...dishInfo,
            DishIngredient: {
              create: ingredients.map((ing) => ({
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                unit_id: ing.unit_id!,
                notes: ing.notes,
                optional: ing.optional || false,
              })),
            },
            ...(tags &&
              tags.length > 0 && {
                DishTag: {
                  create: tags.map((tagId) => ({ tag_id: tagId })),
                },
              }),
          },
          include: {
            DishIngredient: {
              include: {
                ingredient: true,
                unit_ref: true,
              },
            },
            DishTag: {
              include: {
                tag: true,
              },
            },
          },
        });

        // Calculate total cost
        // Calculate total cost - temporarily disabled due to type issues
        const totalCost = 0;

        results.push({
          success: true,
          dish: {
            id: newDish.id,
            name_vi: newDish.name_vi,
            name_en: newDish.name_en,
            total_cost: totalCost,
          },
        });
      } catch (error) {
        results.push({
          success: false,
          dish_name: dishData.name_vi,
          error:
            error instanceof Error ? error.message : "Failed to create dish",
        });
      }
    }

    const summary = {
      total: dishes.length,
      created: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };

    return NextResponse.json(
      {
        summary,
        results,
      },
      { status: 207 }, // 207 Multi-Status
    );
  },
  { requiredPermission: "write", rateLimitConfig: "bulk" },
);
