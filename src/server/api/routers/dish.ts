import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const dishInput = z.object({
  name_vi: z.string().min(1).max(255),
  name_en: z.string().max(255).optional(),
  description_vi: z.string().min(1).max(200),
  description_en: z.string().max(200).optional(),
  instructions_vi: z.string().min(1),
  instructions_en: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cook_time: z.number().int().positive(),
  prep_time: z.number().int().min(0).optional(),
  servings: z.number().int().positive(),
  image_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const dishIngredientInput = z.object({
  ingredient_id: z.string(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  notes: z.string().optional(),
  optional: z.boolean().optional(),
});

export const dishRouter = createTRPCRouter({
  // Get all dishes (public, with filters)
  getAll: publicProcedure
    .input(
      z.object({
        status: z.enum(["active", "inactive", "all"]).optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        maxCookTime: z.number().optional(),
        tags: z.array(z.string()).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const where: any = {};

      if (input.status && input.status !== "all") {
        where.status = input.status;
      } else if (!input.status) {
        where.status = "active";
      }

      if (input.difficulty) {
        where.difficulty = input.difficulty;
      }

      if (input.maxCookTime) {
        where.cook_time = { lte: input.maxCookTime };
      }

      if (input.tags && input.tags.length > 0) {
        where.DishTag = {
          some: {
            tag_id: { in: input.tags },
          },
        };
      }

      if (input.search) {
        where.OR = [
          { name_vi: { contains: input.search, mode: "insensitive" } },
          { name_en: { contains: input.search, mode: "insensitive" } },
          { description_vi: { contains: input.search, mode: "insensitive" } },
          { description_en: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const dishes = await ctx.db.dish.findMany({
        where,
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { created_at: "desc" },
        include: {
          DishTag: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              FavoriteDish: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (dishes.length > limit) {
        const nextItem = dishes.pop();
        nextCursor = nextItem!.id;
      }

      return {
        dishes,
        nextCursor,
      };
    }),

  // Get dish by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const dish = await ctx.db.dish.findUnique({
        where: { id: input.id },
        include: {
          DishIngredient: {
            include: {
              ingredient: true,
            },
          },
          DishTag: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              FavoriteDish: true,
            },
          },
        },
      });

      if (!dish) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dish not found",
        });
      }

      // Calculate total cost
      const totalCost = dish.DishIngredient.reduce((sum, di) => {
        return sum + di.quantity.toNumber() * di.ingredient.current_price.toNumber();
      }, 0);

      return {
        ...dish,
        totalCost,
      };
    }),

  // Create dish (admin only)
  create: protectedProcedure
    .input(
      z.object({
        dish: dishInput,
        ingredients: z.array(dishIngredientInput),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create dishes",
        });
      }

      const dish = await ctx.db.dish.create({
        data: {
          ...input.dish,
          DishIngredient: {
            create: input.ingredients,
          },
          ...(input.tags && input.tags.length > 0
            ? {
                DishTag: {
                  create: input.tags.map((tagId) => ({ tag_id: tagId })),
                },
              }
            : {}),
        },
        include: {
          DishIngredient: {
            include: {
              ingredient: true,
            },
          },
          DishTag: {
            include: {
              tag: true,
            },
          },
        },
      });

      return dish;
    }),

  // Update dish (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dish: dishInput.partial(),
        ingredients: z.array(dishIngredientInput).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update dishes",
        });
      }

      // Update dish basic info
      const dish = await ctx.db.dish.update({
        where: { id: input.id },
        data: input.dish,
      });

      // Update ingredients if provided
      if (input.ingredients) {
        // Delete existing ingredients
        await ctx.db.dishIngredient.deleteMany({
          where: { dish_id: input.id },
        });

        // Create new ingredients
        await ctx.db.dishIngredient.createMany({
          data: input.ingredients.map((ing) => ({
            ...ing,
            dish_id: input.id,
          })),
        });
      }

      // Update tags if provided
      if (input.tags) {
        // Delete existing tags
        await ctx.db.dishTag.deleteMany({
          where: { dish_id: input.id },
        });

        // Create new tags
        if (input.tags.length > 0) {
          await ctx.db.dishTag.createMany({
            data: input.tags.map((tagId) => ({
              dish_id: input.id,
              tag_id: tagId,
            })),
          });
        }
      }

      return ctx.db.dish.findUnique({
        where: { id: input.id },
        include: {
          DishIngredient: {
            include: {
              ingredient: true,
            },
          },
          DishTag: {
            include: {
              tag: true,
            },
          },
        },
      });
    }),

  // Delete dish (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete dishes",
        });
      }

      return ctx.db.dish.delete({
        where: { id: input.id },
      });
    }),

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ dishId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.favoriteDish.findUnique({
        where: {
          user_id_dish_id: {
            user_id: ctx.session.user.id,
            dish_id: input.dishId,
          },
        },
      });

      if (existing) {
        await ctx.db.favoriteDish.delete({
          where: {
            user_id_dish_id: {
              user_id: ctx.session.user.id,
              dish_id: input.dishId,
            },
          },
        });
        return { favorited: false };
      } else {
        await ctx.db.favoriteDish.create({
          data: {
            user_id: ctx.session.user.id,
            dish_id: input.dishId,
          },
        });
        return { favorited: true };
      }
    }),

  // Get user's favorite dishes
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await ctx.db.favoriteDish.findMany({
      where: { user_id: ctx.session.user.id },
      include: {
        dish: {
          include: {
            DishTag: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return favorites.map((f) => f.dish);
  }),
});