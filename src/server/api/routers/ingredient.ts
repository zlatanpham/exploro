import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const ingredientInput = z.object({
  name_vi: z.string().min(1).max(255),
  name_en: z.string().max(255).optional(),
  category: z.string().min(1).max(100),
  default_unit: z.string().min(1).max(50).optional(), // Legacy field
  unit_id: z.string().optional(), // New unit reference
  current_price: z.number().positive(),
  density: z.number().positive().optional(), // For mass-volume conversions
  seasonal_flag: z.boolean().optional(),
});

export const ingredientRouter = createTRPCRouter({
  // Get all ingredients (admin only)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    return ctx.db.ingredient.findMany({
      include: {
        unit: true,
      },
      orderBy: { name_vi: "asc" },
    });
  }),

  // Get ingredients by category
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ingredient.findMany({
        where: { category: input.category },
        orderBy: { name_vi: "asc" },
      });
    }),

  // Search ingredients
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ingredient.findMany({
        where: {
          OR: [
            { name_vi: { contains: input.query, mode: "insensitive" } },
            { name_en: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: 20,
        orderBy: { name_vi: "asc" },
      });
    }),

  // Create ingredient (admin only)
  create: protectedProcedure
    .input(ingredientInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create ingredients",
        });
      }

      const ingredient = await ctx.db.ingredient.create({
        data: {
          ...input,
          price_updated_at: new Date(),
        },
      });

      // Record initial price in history
      await ctx.db.priceHistory.create({
        data: {
          ingredient_id: ingredient.id,
          price: input.current_price,
          unit_id: input.unit_id,
        },
      });

      return ingredient;
    }),

  // Update ingredient (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: ingredientInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update ingredients",
        });
      }

      const currentIngredient = await ctx.db.ingredient.findUnique({
        where: { id: input.id },
      });

      if (!currentIngredient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ingredient not found",
        });
      }

      const updatedIngredient = await ctx.db.ingredient.update({
        where: { id: input.id },
        data: {
          ...input.data,
          price_updated_at:
            input.data.current_price !== undefined
              ? new Date()
              : currentIngredient.price_updated_at,
        },
      });

      // Record price change in history
      if (
        input.data.current_price !== undefined &&
        input.data.current_price !== currentIngredient.current_price.toNumber()
      ) {
        await ctx.db.priceHistory.create({
          data: {
            ingredient_id: input.id,
            price: input.data.current_price,
            unit_id: input.data.unit_id || currentIngredient.unit_id,
          },
        });
      }

      return updatedIngredient;
    }),

  // Delete ingredient (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete ingredients",
        });
      }

      return ctx.db.ingredient.delete({
        where: { id: input.id },
      });
    }),

  // Bulk update prices (admin only)
  bulkUpdatePrices: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          price: z.number().positive(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update prices",
        });
      }

      const results = await Promise.all(
        input.map(async ({ id, price }) => {
          const currentIngredient = await ctx.db.ingredient.findUnique({
            where: { id },
          });

          if (!currentIngredient) {
            return { id, success: false, error: "Ingredient not found" };
          }

          if (price !== currentIngredient.current_price.toNumber()) {
            await ctx.db.ingredient.update({
              where: { id },
              data: {
                current_price: price,
                price_updated_at: new Date(),
              },
            });

            await ctx.db.priceHistory.create({
              data: {
                ingredient_id: id,
                price,
                unit_id: currentIngredient.unit_id,
              },
            });
          }

          return { id, success: true };
        })
      );

      return results;
    }),

  // Get price history for an ingredient
  getPriceHistory: protectedProcedure
    .input(z.object({ ingredientId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view price history",
        });
      }

      return ctx.db.priceHistory.findMany({
        where: { ingredient_id: input.ingredientId },
        orderBy: { recorded_at: "desc" },
        take: 50,
      });
    }),
});