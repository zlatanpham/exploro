import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import bcryptjs from "bcryptjs";

const SALT_ROUNDS = 12;

function generateApiKey(): string {
  const prefix = "sk_live_";
  const randomPart = nanoid(32);
  return `${prefix}${randomPart}`;
}

async function getUserOrganization(
  ctx: any,
): Promise<{ organizationId: string; isGlobalAdmin: boolean }> {
  // Check if user is a global admin
  const user = await ctx.db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { role: true },
  });

  if (user?.role === "admin") {
    // Global admin - get their first organization
    const userOrg = await ctx.db.organizationMember.findFirst({
      where: {
        user_id: ctx.session.user.id,
      },
    });

    if (!userOrg) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No organization found for user",
      });
    }

    return { organizationId: userOrg.organization_id, isGlobalAdmin: true };
  }

  // Not a global admin - check organization role
  const userOrg = await ctx.db.organizationMember.findFirst({
    where: {
      user_id: ctx.session.user.id,
      role: { in: ["admin", "owner"] },
    },
  });

  if (!userOrg) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to manage API keys",
    });
  }

  return { organizationId: userOrg.organization_id, isGlobalAdmin: false };
}

export const apiKeyRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { organizationId } = await getUserOrganization(ctx);

    const apiKeys = await ctx.db.apiKey.findMany({
      where: {
        organization_id: organizationId,
      },
      select: {
        id: true,
        name: true,
        permissions: true,
        last_used_at: true,
        expires_at: true,
        is_active: true,
        created_at: true,
        usage_count: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return apiKeys.map((key) => ({
      ...key,
      key_preview: `sk_live_...${key.id.slice(-4)}`,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(255),
        permissions: z
          .array(z.enum(["read", "write", "admin"]))
          .default(["read", "write"]),
        expires_at: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = await getUserOrganization(ctx);

      const rawKey = generateApiKey();
      const keyHash = await bcryptjs.hash(rawKey, SALT_ROUNDS);

      const apiKey = await ctx.db.apiKey.create({
        data: {
          organization_id: organizationId,
          name: input.name,
          key_hash: keyHash,
          permissions: input.permissions,
          expires_at: input.expires_at,
          created_by: ctx.session.user.id,
        },
        select: {
          id: true,
          name: true,
          permissions: true,
          expires_at: true,
          created_at: true,
        },
      });

      return {
        ...apiKey,
        key: rawKey, // Only returned once on creation
      };
    }),

  revoke: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = await getUserOrganization(ctx);

      const apiKey = await ctx.db.apiKey.findFirst({
        where: {
          id: input.id,
          organization_id: organizationId,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      await ctx.db.apiKey.update({
        where: { id: input.id },
        data: {
          is_active: false,
          revoked_at: new Date(),
          revoked_by: ctx.session.user.id,
          revoke_reason: input.reason,
        },
      });

      return { success: true };
    }),

  getUsageStats: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = await getUserOrganization(ctx);

      const apiKey = await ctx.db.apiKey.findFirst({
        where: {
          id: input.id,
          organization_id: organizationId,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      const stats = await ctx.db.apiUsageLog.groupBy({
        by: ["endpoint", "method", "status_code"],
        where: {
          api_key_id: input.id,
        },
        _count: true,
        _avg: {
          response_time: true,
        },
      });

      const recentLogs = await ctx.db.apiUsageLog.findMany({
        where: {
          api_key_id: input.id,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 100,
        select: {
          endpoint: true,
          method: true,
          status_code: true,
          response_time: true,
          error_message: true,
          created_at: true,
        },
      });

      return {
        stats,
        recentLogs,
      };
    }),
});
