import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const unitRouter = createTRPCRouter({
  // Get all units grouped by category
  getAllGrouped: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.unitCategory.findMany({
      include: {
        units: {
          orderBy: [
            { is_base_unit: 'desc' },
            { symbol: 'asc' },
          ],
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }),

  // Get all units in a specific category
  getByCategory: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.unit.findMany({
        where: { category_id: input.categoryId },
        orderBy: [
          { is_base_unit: 'desc' },
          { symbol: 'asc' },
        ],
      });
    }),

  // Get compatible units for a given unit
  getCompatibleUnits: protectedProcedure
    .input(z.object({
      unitId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const unit = await ctx.db.unit.findUnique({
        where: { id: input.unitId },
      });

      if (!unit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unit not found',
        });
      }

      // Get all units in the same category
      const compatibleUnits = await ctx.db.unit.findMany({
        where: { category_id: unit.category_id },
        orderBy: [
          { is_base_unit: 'desc' },
          { symbol: 'asc' },
        ],
      });

      return compatibleUnits;
    }),

  // Test unit conversion
  testConversion: protectedProcedure
    .input(z.object({
      quantity: z.number().positive(),
      fromUnitId: z.string(),
      toUnitId: z.string(),
      density: z.number().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { UnitConversionService } = await import('../../services/unitConversion');
      const conversionService = new UnitConversionService(ctx.db);

      if (input.density) {
        return await conversionService.convertWithDensity(
          input.quantity,
          input.fromUnitId,
          input.toUnitId,
          input.density,
        );
      }

      return await conversionService.convert(
        input.quantity,
        input.fromUnitId,
        input.toUnitId,
      );
    }),

  // Admin procedures for unit management
  createUnit: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      symbol: z.string().min(1).max(20),
      nameVi: z.string().min(1).max(100),
      nameEn: z.string().min(1).max(100),
      pluralVi: z.string().max(100).optional(),
      pluralEn: z.string().max(100).optional(),
      isBaseUnit: z.boolean().default(false),
      factorToBase: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create units',
        });
      }
      
      // Check if symbol already exists
      const existing = await ctx.db.unit.findUnique({
        where: { symbol: input.symbol },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Unit with this symbol already exists',
        });
      }

      // If setting as base unit, unset current base unit
      if (input.isBaseUnit) {
        await ctx.db.unit.updateMany({
          where: {
            category_id: input.categoryId,
            is_base_unit: true,
          },
          data: { is_base_unit: false },
        });
      }

      return await ctx.db.unit.create({
        data: {
          category_id: input.categoryId,
          symbol: input.symbol,
          name_vi: input.nameVi,
          name_en: input.nameEn,
          plural_vi: input.pluralVi,
          plural_en: input.pluralEn,
          is_base_unit: input.isBaseUnit,
          factor_to_base: input.factorToBase,
        },
      });
    }),

  createConversion: protectedProcedure
    .input(z.object({
      fromUnitId: z.string(),
      toUnitId: z.string(),
      factor: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create conversions',
        });
      }
      
      // Check if conversion already exists
      const existing = await ctx.db.unitConversion.findUnique({
        where: {
          from_unit_id_to_unit_id: {
            from_unit_id: input.fromUnitId,
            to_unit_id: input.toUnitId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Conversion already exists',
        });
      }

      // Create the conversion and its inverse
      await ctx.db.$transaction([
        ctx.db.unitConversion.create({
          data: {
            from_unit_id: input.fromUnitId,
            to_unit_id: input.toUnitId,
            factor: input.factor,
            is_direct: true,
          },
        }),
        ctx.db.unitConversion.create({
          data: {
            from_unit_id: input.toUnitId,
            to_unit_id: input.fromUnitId,
            factor: 1 / input.factor,
            is_direct: true,
          },
        }),
      ]);

      return { success: true };
    }),
});