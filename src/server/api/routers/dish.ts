import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { normalizeVietnamese } from "@/server/utils/vietnamese";

const dishInput = z.object({
  name_vi: z.string().min(1).max(255),
  name_en: z.string().max(255).optional(),
  description_vi: z.string().min(1).max(1000),
  description_en: z.string().max(1000).optional(),
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
  unit_id: z.string().min(1, "Unit ID is required").optional(), // Unit reference (preferring unit_id over legacy unit field)
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
      }),
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
        // Use a simpler approach: get all dishes and filter in memory
        // This is more reliable for Vietnamese diacritic search
        delete where.OR;
      }

      let dishes = await ctx.db.dish.findMany({
        where,
        take: input.search ? undefined : limit + 1, // Get all dishes if searching
        cursor:
          input.cursor && !input.search ? { id: input.cursor } : undefined,
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

      // If searching, filter dishes in memory using Vietnamese normalization
      if (input.search) {
        const normalizedSearch = normalizeVietnamese(input.search);
        dishes = dishes.filter((dish) => {
          const normalizedNameVi = normalizeVietnamese(dish.name_vi);
          const normalizedNameEn = dish.name_en
            ? normalizeVietnamese(dish.name_en)
            : "";
          const normalizedDescVi = normalizeVietnamese(dish.description_vi);
          const normalizedDescEn = dish.description_en
            ? normalizeVietnamese(dish.description_en)
            : "";

          return (
            normalizedNameVi.includes(normalizedSearch) ||
            normalizedNameEn.includes(normalizedSearch) ||
            normalizedDescVi.includes(normalizedSearch) ||
            normalizedDescEn.includes(normalizedSearch)
          );
        });

        // Apply manual pagination for search results
        const startIndex = input.cursor
          ? dishes.findIndex((d) => d.id === input.cursor) + 1
          : 0;
        dishes = dishes.slice(startIndex, startIndex + limit);
      }

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (!input.search && dishes.length > limit) {
        const nextItem = dishes.pop();
        nextCursor = nextItem!.id;
      } else if (input.search) {
        // For search results, we need a different approach for pagination
        // This is simplified - in production you might want to implement proper cursor-based pagination
        nextCursor =
          dishes.length === limit ? dishes[dishes.length - 1]?.id : undefined;
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
              ingredient: {
                include: {
                  unit: true,
                },
              },
              unit_ref: true,
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

      // Calculate total cost and ensure converted quantities are populated
      const { UnitConversionService } = await import(
        "../../services/unitConversion"
      );
      const conversionService = new UnitConversionService(ctx.db);

      let totalCost = 0;
      const updatedDishIngredients = [];

      for (const di of dish.DishIngredient) {
        let quantityInBaseUnit = di.quantity.toNumber();

        // Apply unit conversion if units are different and converted_quantity is not set
        if (
          di.unit_id &&
          di.ingredient.unit_id &&
          di.unit_id !== di.ingredient.unit_id
        ) {
          if (!di.converted_quantity) {
            let result = await conversionService.convert(
              di.quantity,
              di.unit_id,
              di.ingredient.unit_id,
            );

            // If regular conversion failed, try density-based conversion
            if (!result.success && di.ingredient.density) {
              console.log(
                `Trying density conversion for ${di.ingredient.name_vi}: density ${di.ingredient.density?.toNumber() ?? "unknown"} g/ml`,
              );
              result = await conversionService.convertWithDensity(
                di.quantity,
                di.unit_id,
                di.ingredient.unit_id,
                di.ingredient.density,
              );
            }

            if (result.success && result.convertedValue) {
              quantityInBaseUnit = result.convertedValue.toNumber();

              // Update the database record with converted quantity
              await ctx.db.dishIngredient.update({
                where: { id: di.id },
                data: {
                  converted_quantity: result.convertedValue,
                  conversion_factor: result.convertedValue.div(di.quantity),
                },
              });

              // Update the local object for return
              di.converted_quantity = result.convertedValue;
              di.conversion_factor = result.convertedValue.div(di.quantity);
            } else {
              console.warn(
                `Failed to convert from ${di.unit_id} to ${di.ingredient.unit_id}:`,
                result.error,
              );
            }
          } else {
            quantityInBaseUnit = di.converted_quantity.toNumber();
          }
        }

        totalCost +=
          quantityInBaseUnit * di.ingredient.current_price.toNumber();
        updatedDishIngredients.push(di);
      }

      return {
        ...dish,
        DishIngredient: updatedDishIngredients,
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create dishes",
        });
      }

      // Import conversion service
      const { UnitConversionService } = await import(
        "../../services/unitConversion"
      );
      const conversionService = new UnitConversionService(ctx.db);

      // Process ingredients with unit conversion
      const processedIngredients = await Promise.all(
        input.ingredients.map(async (ing) => {
          const ingredient = await ctx.db.ingredient.findUnique({
            where: { id: ing.ingredient_id },
            include: { unit: true },
          });

          if (!ingredient) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Ingredient ${ing.ingredient_id} not found`,
            });
          }

          let convertedQuantity = null;
          let conversionFactor = null;

          // Calculate conversion if units are different
          if (
            ing.unit_id &&
            ingredient.unit_id &&
            ing.unit_id !== ingredient.unit_id
          ) {
            const result = await conversionService.convert(
              ing.quantity,
              ing.unit_id,
              ingredient.unit_id,
            );

            if (result.success && result.convertedValue) {
              convertedQuantity = result.convertedValue;
              conversionFactor = result.convertedValue.div(ing.quantity);
            }
          }

          return {
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit_id: ing.unit_id!,
            notes: ing.notes,
            optional: ing.optional,
            converted_quantity: convertedQuantity,
            conversion_factor: conversionFactor,
          };
        }),
      );

      const dish = await ctx.db.dish.create({
        data: {
          ...input.dish,
          DishIngredient: {
            create: processedIngredients,
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
              ingredient: {
                include: {
                  unit: true,
                },
              },
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update dishes",
        });
      }

      // Update dish basic info
      await ctx.db.dish.update({
        where: { id: input.id },
        data: input.dish,
      });

      // Update ingredients if provided
      if (input.ingredients) {
        // Import conversion service
        const { UnitConversionService } = await import(
          "../../services/unitConversion"
        );
        const conversionService = new UnitConversionService(ctx.db);

        // Process ingredients with unit conversion
        const processedIngredients = await Promise.all(
          input.ingredients.map(async (ing) => {
            const ingredient = await ctx.db.ingredient.findUnique({
              where: { id: ing.ingredient_id },
              include: { unit: true },
            });

            if (!ingredient) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Ingredient ${ing.ingredient_id} not found`,
              });
            }

            let convertedQuantity = null;
            let conversionFactor = null;

            // Calculate conversion if units are different
            if (
              ing.unit_id &&
              ingredient.unit_id &&
              ing.unit_id !== ingredient.unit_id
            ) {
              const result = await conversionService.convert(
                ing.quantity,
                ing.unit_id,
                ingredient.unit_id,
              );

              if (result.success && result.convertedValue) {
                convertedQuantity = result.convertedValue;
                conversionFactor = result.convertedValue.div(ing.quantity);
              }
            }

            return {
              ingredient_id: ing.ingredient_id,
              quantity: ing.quantity,
              unit_id: ing.unit_id!,
              notes: ing.notes,
              optional: ing.optional,
              dish_id: input.id,
              converted_quantity: convertedQuantity,
              conversion_factor: conversionFactor,
            };
          }),
        );

        // Delete existing ingredients
        await ctx.db.dishIngredient.deleteMany({
          where: { dish_id: input.id },
        });

        // Create new ingredients with conversion data
        await ctx.db.dishIngredient.createMany({
          data: processedIngredients,
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
              ingredient: {
                include: {
                  unit: true,
                },
              },
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
