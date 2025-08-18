import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { UnitConversionService } from "@/server/services/unitConversion";

const ingredientMappingInput = z.object({
  ingredientId: z.string().min(1),
  countUnitId: z.string().min(1),
  measurableUnitId: z.string().min(1),
  quantity: z.number().positive(),
});

const ingredientMappingDeleteInput = z.object({
  ingredientId: z.string().min(1),
  countUnitId: z.string().min(1),
});

export const ingredientUnitMappingRouter = createTRPCRouter({
  // Get all mappings for an ingredient
  getByIngredient: protectedProcedure
    .input(z.object({ ingredientId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access ingredient mappings",
        });
      }

      return ctx.db.ingredientUnitMapping.findMany({
        where: { ingredient_id: input.ingredientId },
        include: {
          count_unit: {
            include: {
              category: true,
            },
          },
          measurable_unit: {
            include: {
              category: true,
            },
          },
        },
      });
    }),

  // Get all mappings (admin only)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access ingredient mappings",
      });
    }

    return ctx.db.ingredientUnitMapping.findMany({
      include: {
        ingredient: {
          select: {
            id: true,
            name_vi: true,
            name_en: true,
          },
        },
        count_unit: {
          include: {
            category: true,
          },
        },
        measurable_unit: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { ingredient: { name_vi: "asc" } },
        { count_unit: { symbol: "asc" } },
      ],
    });
  }),

  // Create or update mapping
  upsert: protectedProcedure
    .input(ingredientMappingInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage ingredient mappings",
        });
      }

      const conversionService = new UnitConversionService(ctx.db);
      
      try {
        return await conversionService.setIngredientMapping(
          input.ingredientId,
          input.countUnitId,
          input.measurableUnitId,
          input.quantity
        );
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to create mapping",
        });
      }
    }),

  // Delete mapping
  delete: protectedProcedure
    .input(ingredientMappingDeleteInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage ingredient mappings",
        });
      }

      const conversionService = new UnitConversionService(ctx.db);
      
      try {
        return await conversionService.deleteIngredientMapping(
          input.ingredientId,
          input.countUnitId
        );
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to delete mapping",
        });
      }
    }),

  // Test conversion with mapping
  testConversion: protectedProcedure
    .input(z.object({
      ingredientId: z.string().min(1),
      quantity: z.number().positive(),
      fromUnitId: z.string().min(1),
      toUnitId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can test conversions",
        });
      }

      const conversionService = new UnitConversionService(ctx.db);
      
      try {
        const result = await conversionService.convertWithIngredientMapping(
          input.quantity,
          input.fromUnitId,
          input.toUnitId,
          input.ingredientId
        );

        return {
          ...result,
          convertedValue: result.convertedValue?.toString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Conversion test failed",
        });
      }
    }),

  // Bulk create mappings for common ingredients
  bulkCreate: protectedProcedure
    .input(z.object({
      mappings: z.array(ingredientMappingInput),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can bulk create mappings",
        });
      }

      const conversionService = new UnitConversionService(ctx.db);
      const results = [];
      const errors = [];

      for (const mapping of input.mappings) {
        try {
          const result = await conversionService.setIngredientMapping(
            mapping.ingredientId,
            mapping.countUnitId,
            mapping.measurableUnitId,
            mapping.quantity
          );
          results.push(result);
        } catch (error) {
          errors.push({
            mapping,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        successful: results.length,
        failed: errors.length,
        errors: errors,
        results: results,
      };
    }),
});