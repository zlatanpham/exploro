import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const tagInput = z.object({
  name_vi: z.string().min(1).max(100),
  name_en: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
});

export const tagRouter = createTRPCRouter({
  // Get all tags (public)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      orderBy: { name_vi: "asc" },
    });
  }),

  // Get tags by category
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tag.findMany({
        where: { category: input.category },
        orderBy: { name_vi: "asc" },
      });
    }),

  // Create tag (admin only)
  create: protectedProcedure
    .input(tagInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create tags",
        });
      }

      return ctx.db.tag.create({
        data: input,
      });
    }),

  // Update tag (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: tagInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update tags",
        });
      }

      return ctx.db.tag.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Delete tag (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete tags",
        });
      }

      return ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),
});