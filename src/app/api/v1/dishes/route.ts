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

// GET /api/v1/dishes - List dishes
export const GET = withApiAuth(
  async (request, context) => {
    const searchParams = getQueryParams(request);
    const { limit, offset } = getPaginationParams(searchParams);

    const status = searchParams.get("status");
    const difficulty = searchParams.get("difficulty");
    const maxCookTime = searchParams.get("max_cook_time");
    const tags = searchParams.getAll("tags");
    const search = searchParams.get("search");
    const includeIngredients =
      searchParams.get("include_ingredients") === "true";

    // Build where clause
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (maxCookTime) {
      where.cook_time = { lte: parseInt(maxCookTime) };
    }

    if (tags.length > 0) {
      where.DishTag = {
        some: {
          tag_id: { in: tags },
        },
      };
    }

    if (search) {
      where.OR = [
        { name_vi: { contains: search, mode: "insensitive" } },
        { name_en: { contains: search, mode: "insensitive" } },
        { description_vi: { contains: search, mode: "insensitive" } },
        { description_en: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await db.dish.count({ where });

    // Get dishes
    const dishes = await db.dish.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
      include: {
        DishTag: {
          include: {
            tag: true,
          },
        },
        ...(includeIngredients
          ? {
              DishIngredient: {
                include: {
                  ingredient: true,
                  unit_ref: true,
                },
              },
            }
          : {}),
      },
    });

    // Calculate costs if ingredients are included
    const dishesWithCost = dishes.map((dish: any) => {
      const totalCost =
        includeIngredients && dish.DishIngredient
          ? dish.DishIngredient.reduce(
              (sum: number, di: any) =>
                sum +
                di.quantity.toNumber() * di.ingredient.current_price.toNumber(),
              0,
            )
          : undefined;

      return {
        id: dish.id,
        name_vi: dish.name_vi,
        name_en: dish.name_en,
        description_vi: dish.description_vi,
        description_en: dish.description_en,
        difficulty: dish.difficulty,
        cook_time: dish.cook_time,
        prep_time: dish.prep_time,
        servings: dish.servings,
        image_url: dish.image_url,
        source_url: dish.source_url,
        status: dish.status,
        created_at: dish.created_at,
        updated_at: dish.updated_at,
        tags: dish.DishTag.map((dt: any) => ({
          id: dt.tag.id,
          name_vi: dt.tag.name_vi,
          name_en: dt.tag.name_en,
          category: dt.tag.category,
        })),
        ...(includeIngredients &&
          dish.DishIngredient && {
            ingredients: dish.DishIngredient.map((di: any) => ({
              ingredient_id: di.ingredient_id,
              name_vi: di.ingredient.name_vi,
              name_en: di.ingredient.name_en,
              quantity: di.quantity.toNumber(),
              unit_id: di.unit_id,
              unit: di.unit_ref ? {
                id: di.unit_ref.id,
                symbol: di.unit_ref.symbol,
                name_vi: di.unit_ref.name_vi,
                name_en: di.unit_ref.name_en,
              } : null,
              optional: di.optional,
              notes: di.notes,
            })),
            total_cost: totalCost,
          }),
      };
    });

    return NextResponse.json({
      dishes: dishesWithCost,
      total,
      limit,
      offset,
    });
  },
  { requiredPermission: "read" },
);

// Schema for creating dish
const createDishSchema = z.object({
  dish: z.object({
    name_vi: z.string().min(1, "Vietnamese name is required").max(255),
    name_en: z.string().max(255).optional(),
    description_vi: z.string().min(1, "Vietnamese description is required"),
    description_en: z.string().optional(),
    instructions_vi: z.string().min(1, "Vietnamese instructions are required"),
    instructions_en: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    cook_time: z.number().int().positive("Cook time must be positive"),
    prep_time: z.number().int().nonnegative().default(0),
    servings: z.number().int().positive().default(4),
    image_url: z.string().url().optional(),
    source_url: z.string().url().optional(),
    status: z.enum(["active", "inactive"]).default("active"),
  }),
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
});

// POST /api/v1/dishes - Create dish
export const POST = withApiAuth(
  async (request, context) => {
    const body = await parseJsonBody(request, (data) =>
      createDishSchema.parse(data),
    );

    const { dish: dishData, ingredients, tags } = body;

    // Validate all ingredient IDs exist
    const ingredientIds = ingredients.map((i) => i.ingredient_id);
    const existingIngredients = await db.ingredient.findMany({
      where: { id: { in: ingredientIds } },
      select: { id: true },
    });

    if (existingIngredients.length !== ingredientIds.length) {
      const foundIds = existingIngredients.map((i) => i.id);
      const missingIds = ingredientIds.filter((id) => !foundIds.includes(id));

      throw new ApiError("VALIDATION_ERROR", {
        message: "Some ingredients were not found",
        missing_ingredient_ids: missingIds,
      });
    }

    // Validate all tag IDs exist if provided
    if (tags && tags.length > 0) {
      const existingTags = await db.tag.findMany({
        where: { id: { in: tags } },
        select: { id: true },
      });

      if (existingTags.length !== tags.length) {
        const foundIds = existingTags.map((t) => t.id);
        const missingIds = tags.filter((id) => !foundIds.includes(id));

        throw new ApiError("VALIDATION_ERROR", {
          message: "Some tags were not found",
          missing_tag_ids: missingIds,
        });
      }
    }

    // Create dish with associations
    const newDish = await db.dish.create({
      data: {
        ...dishData,
        DishIngredient: {
          create: ingredients,
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
    const totalCost = newDish.DishIngredient.reduce(
      (sum, di) =>
        sum + di.quantity.toNumber() * di.ingredient.current_price.toNumber(),
      0,
    );

    return NextResponse.json(
      {
        dish: {
          id: newDish.id,
          name_vi: newDish.name_vi,
          name_en: newDish.name_en,
          description_vi: newDish.description_vi,
          description_en: newDish.description_en,
          instructions_vi: newDish.instructions_vi,
          instructions_en: newDish.instructions_en,
          difficulty: newDish.difficulty,
          cook_time: newDish.cook_time,
          prep_time: newDish.prep_time,
          servings: newDish.servings,
          image_url: newDish.image_url,
          source_url: newDish.source_url,
          status: newDish.status,
          created_at: newDish.created_at,
          updated_at: newDish.updated_at,
          ingredients: newDish.DishIngredient.map((di) => ({
            ingredient_id: di.ingredient.id,
            name_vi: di.ingredient.name_vi,
            name_en: di.ingredient.name_en,
            quantity: di.quantity.toNumber(),
            unit_id: di.unit_id,
            unit: di.unit_ref ? {
              id: di.unit_ref.id,
              symbol: di.unit_ref.symbol,
              name_vi: di.unit_ref.name_vi,
              name_en: di.unit_ref.name_en,
            } : null,
            optional: di.optional,
            notes: di.notes,
          })),
          tags: newDish.DishTag.map((dt) => ({
            id: dt.tag.id,
            name_vi: dt.tag.name_vi,
            name_en: dt.tag.name_en,
            category: dt.tag.category,
          })),
          total_cost: totalCost,
        },
      },
      { status: 201 },
    );
  },
  { requiredPermission: "write" },
);
