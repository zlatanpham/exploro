import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
import { organizationRouter } from "./routers/organization";
import { userRouter } from "./routers/user";
import { dishRouter } from "./routers/dish";
import { ingredientRouter } from "./routers/ingredient";
import { tagRouter } from "./routers/tag";
import { menuRouter } from "./routers/menu";
import { apiKeyRouter } from "./routers/apiKey";
import { unitRouter } from "./routers/unit";

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  user: userRouter,
  dish: dishRouter,
  ingredient: ingredientRouter,
  tag: tagRouter,
  menu: menuRouter,
  apiKey: apiKeyRouter,
  unit: unitRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
