import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const menuInput = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  servings: z.number().int().positive(),
  visibility: z.enum(["private", "public"]).optional(),
});

const menuDishInput = z.object({
  dish_id: z.string(),
  meal_group: z.string().max(50).optional(),
  day_index: z.number().int().min(0).max(6).optional(),
  quantity: z.number().int().positive().optional(),
  order_index: z.number().int().optional(),
});

export const menuRouter = createTRPCRouter({
  // Get user's menus
  getUserMenus: protectedProcedure
    .input(
      z.object({
        visibility: z.enum(["private", "public", "all"]).optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const where: any = { user_id: ctx.session.user.id };

      if (input.visibility && input.visibility !== "all") {
        where.visibility = input.visibility;
      }

      const menus = await ctx.db.menu.findMany({
        where,
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updated_at: "desc" },
        include: {
          _count: {
            select: {
              MenuDish: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (menus.length > limit) {
        const nextItem = menus.pop();
        nextCursor = nextItem!.id;
      }

      return {
        menus,
        nextCursor,
      };
    }),

  // Get public menus
  getPublicMenus: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const where: any = { visibility: "public" };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const menus = await ctx.db.menu.findMany({
        where,
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updated_at: "desc" },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              MenuDish: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (menus.length > limit) {
        const nextItem = menus.pop();
        nextCursor = nextItem!.id;
      }

      return {
        menus,
        nextCursor,
      };
    }),

  // Get menu by ID with full details
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const menu = await ctx.db.menu.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          MenuDish: {
            include: {
              dish: {
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
              },
            },
            orderBy: [{ day_index: "asc" }, { order_index: "asc" }],
          },
        },
      });

      if (!menu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      // Check permissions
      if (
        menu.visibility === "private" &&
        menu.user_id !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this menu",
        });
      }

      // Calculate aggregated ingredients and total cost
      const ingredientMap = new Map<
        string,
        {
          ingredient: any;
          totalQuantity: number;
          unit: string;
          dishes: string[];
        }
      >();

      menu.MenuDish.forEach((menuDish) => {
        const dishQuantity = menuDish.quantity;
        const servingMultiplier = menu.servings / menuDish.dish.servings;

        menuDish.dish.DishIngredient.forEach((dishIngredient) => {
          const key = dishIngredient.ingredient_id;
          const scaledQuantity =
            (dishIngredient.converted_quantity?.toNumber() ||
              dishIngredient.quantity.toNumber()) *
            dishQuantity *
            servingMultiplier;
          const existing = ingredientMap.get(key);

          if (existing) {
            existing.totalQuantity += scaledQuantity;
            if (!existing.dishes.includes(menuDish.dish.name_vi)) {
              existing.dishes.push(menuDish.dish.name_vi);
            }
          } else {
            ingredientMap.set(key, {
              ingredient: dishIngredient.ingredient,
              totalQuantity: scaledQuantity,
              unit:
                dishIngredient.unit || dishIngredient.unit_ref?.symbol || "",
              dishes: [menuDish.dish.name_vi],
            });
          }
        });
      });

      const aggregatedIngredients = Array.from(ingredientMap.values());
      const totalCost = aggregatedIngredients.reduce((sum, item) => {
        return (
          sum + item.totalQuantity * item.ingredient.current_price.toNumber()
        );
      }, 0);

      const costPerPerson = menu.servings > 0 ? totalCost / menu.servings : 0;

      return {
        ...menu,
        aggregatedIngredients,
        totalCost,
        costPerPerson,
      };
    }),

  // Create menu
  create: protectedProcedure
    .input(
      z.object({
        menu: menuInput,
        dishes: z.array(menuDishInput).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Ensure user exists by finding them first
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please log in again.",
        });
      }

      const menu = await ctx.db.menu.create({
        data: {
          ...input.menu,
          user: {
            connect: { id: user.id },
          },
          ...(input.dishes && input.dishes.length > 0
            ? {
                MenuDish: {
                  create: input.dishes,
                },
              }
            : {}),
        },
        include: {
          MenuDish: {
            include: {
              dish: true,
            },
          },
        },
      });

      return menu;
    }),

  // Update menu
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        menu: menuInput.partial(),
        dishes: z.array(menuDishInput).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingMenu = await ctx.db.menu.findUnique({
        where: { id: input.id },
      });

      if (!existingMenu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      if (existingMenu.user_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this menu",
        });
      }

      // Update menu basic info
      await ctx.db.menu.update({
        where: { id: input.id },
        data: input.menu,
      });

      // Update dishes if provided
      if (input.dishes !== undefined) {
        // Delete existing dishes
        await ctx.db.menuDish.deleteMany({
          where: { menu_id: input.id },
        });

        // Create new dishes
        if (input.dishes.length > 0) {
          await ctx.db.menuDish.createMany({
            data: input.dishes.map((dish) => ({
              ...dish,
              menu_id: input.id,
            })),
          });
        }
      }

      return ctx.db.menu.findUnique({
        where: { id: input.id },
        include: {
          MenuDish: {
            include: {
              dish: true,
            },
          },
        },
      });
    }),

  // Delete menu
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const menu = await ctx.db.menu.findUnique({
        where: { id: input.id },
      });

      if (!menu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      if (menu.user_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this menu",
        });
      }

      return ctx.db.menu.delete({
        where: { id: input.id },
      });
    }),

  // Duplicate menu
  duplicate: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sourceMenu = await ctx.db.menu.findUnique({
        where: { id: input.id },
        include: {
          MenuDish: true,
        },
      });

      if (!sourceMenu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      // Check permissions
      if (
        sourceMenu.visibility === "private" &&
        sourceMenu.user_id !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to duplicate this menu",
        });
      }

      const newMenu = await ctx.db.menu.create({
        data: {
          name: input.name,
          description: sourceMenu.description,
          servings: sourceMenu.servings,
          visibility: "private",
          user: {
            connect: { id: ctx.session.user.id },
          },
          MenuDish: {
            create: sourceMenu.MenuDish.map((dish) => ({
              dish_id: dish.dish_id,
              meal_group: dish.meal_group,
              day_index: dish.day_index,
              quantity: dish.quantity,
              order_index: dish.order_index,
            })),
          },
        },
        include: {
          MenuDish: {
            include: {
              dish: true,
            },
          },
        },
      });

      return newMenu;
    }),

  // Create share link
  createShare: protectedProcedure
    .input(
      z.object({
        menuId: z.string(),
        permissions: z.enum(["view", "clone"]).optional(),
        expiresIn: z.number().optional(), // hours
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const menu = await ctx.db.menu.findUnique({
        where: { id: input.menuId },
      });

      if (!menu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      if (menu.user_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to share this menu",
        });
      }

      const expiresAt = input.expiresIn
        ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000)
        : undefined;

      const share = await ctx.db.menuShare.create({
        data: {
          menu_id: input.menuId,
          permissions: input.permissions ?? "view",
          expires_at: expiresAt,
        },
      });

      return share;
    }),

  // Get menu by share code
  getByShareCode: publicProcedure
    .input(z.object({ shareCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.db.menuShare.findUnique({
        where: { share_code: input.shareCode },
        include: {
          menu: {
            include: {
              user: {
                select: {
                  name: true,
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
                      DishTag: {
                        include: {
                          tag: true,
                        },
                      },
                    },
                  },
                },
                orderBy: [{ day_index: "asc" }, { order_index: "asc" }],
              },
            },
          },
        },
      });

      if (!share) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share link not found",
        });
      }

      if (share.expires_at && share.expires_at < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Share link has expired",
        });
      }

      return {
        share,
        menu: share.menu,
      };
    }),
});
