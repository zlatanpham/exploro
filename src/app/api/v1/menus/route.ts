import { NextResponse } from "next/server";
import {
  withApiAuth,
  getQueryParams,
  getPaginationParams,
  parseJsonBody,
} from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/server/db";
import { z } from "zod";

// GET /api/v1/menus - List menus
export const GET = withApiAuth(
  async (request, _context) => {
    const searchParams = getQueryParams(request);
    const { limit, offset } = getPaginationParams(searchParams);

    const visibility = searchParams.get("visibility");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Build where clause - menus are user-specific, not org-specific
    const where: any = {};

    if (visibility) {
      where.visibility = visibility;
    }

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ start_date: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.AND.push({ end_date: { lte: new Date(endDate) } });
      }
    }

    // Get total count
    const total = await db.menu.count({ where });

    // Get menus
    const menus = await db.menu.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        MenuDish: {
          include: {
            dish: {
              include: {
                DishIngredient: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate costs
    const menusWithCost = menus.map((menu) => {
      const totalCost = menu.MenuDish.reduce((menuSum, md) => {
        const servingMultiplier = menu.servings / md.dish.servings;
        const dishCost = md.dish.DishIngredient.reduce(
          (dishSum, di) =>
            dishSum +
            di.quantity.toNumber() * di.ingredient.current_price.toNumber(),
          0,
        );
        return menuSum + dishCost * md.quantity * servingMultiplier;
      }, 0);

      return {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        start_date: menu.start_date,
        end_date: menu.end_date,
        servings: menu.servings,
        visibility: menu.visibility,
        created_at: menu.created_at,
        updated_at: menu.updated_at,
        user: menu.user,
        dishes_count: menu.MenuDish.length,
        total_cost: totalCost,
      };
    });

    return NextResponse.json({
      menus: menusWithCost,
      total,
      limit,
      offset,
    });
  },
  { requiredPermission: "read" },
);

// Schema for creating menu
const createMenuSchema = z.object({
  menu: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    servings: z.number().int().positive().default(4),
    visibility: z.enum(["private", "public"]).default("private"),
  }),
  dishes: z
    .array(
      z.object({
        dish_id: z.string(),
        meal_group: z.string().max(50).optional(),
        day_index: z.number().int().min(0).max(6).optional(),
        quantity: z.number().int().positive().default(1),
        order_index: z.number().int().nonnegative().default(0),
      }),
    )
    .optional(),
});

// POST /api/v1/menus - Create menu
export const POST = withApiAuth(
  async (request, _context) => {
    const body = await parseJsonBody(request, (data) =>
      createMenuSchema.parse(data),
    );

    const { menu: menuData, dishes } = body;

    // Find a user associated with this API key's organization
    // For now, we'll use the API key creator
    const apiKey = await db.apiKey.findUnique({
      where: { id: _context.apiKey.id },
      select: { created_by: true },
    });

    if (!apiKey) {
      throw new ApiError("INTERNAL_ERROR");
    }

    // Validate all dish IDs exist if provided
    if (dishes && dishes.length > 0) {
      const dishIds = dishes.map((d) => d.dish_id);
      const existingDishes = await db.dish.findMany({
        where: { id: { in: dishIds } },
        select: { id: true },
      });

      if (existingDishes.length !== dishIds.length) {
        const foundIds = existingDishes.map((d) => d.id);
        const missingIds = dishIds.filter((id) => !foundIds.includes(id));

        throw new ApiError("VALIDATION_ERROR", {
          message: "Some dishes were not found",
          missing_dish_ids: missingIds,
        });
      }
    }

    // Create menu with associations
    const newMenu = await db.menu.create({
      data: {
        ...menuData,
        user_id: apiKey.created_by,
        ...(dishes &&
          dishes.length > 0 && {
            MenuDish: {
              create: dishes,
            },
          }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        MenuDish: {
          include: {
            dish: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        menu: {
          id: newMenu.id,
          name: newMenu.name,
          description: newMenu.description,
          start_date: newMenu.start_date,
          end_date: newMenu.end_date,
          servings: newMenu.servings,
          visibility: newMenu.visibility,
          created_at: newMenu.created_at,
          updated_at: newMenu.updated_at,
          user: newMenu.user,
          dishes: newMenu.MenuDish.map((md) => ({
            dish_id: md.dish.id,
            name_vi: md.dish.name_vi,
            name_en: md.dish.name_en,
            meal_group: md.meal_group,
            day_index: md.day_index,
            quantity: md.quantity,
            order_index: md.order_index,
          })),
        },
      },
      { status: 201 },
    );
  },
  { requiredPermission: "write" },
);
