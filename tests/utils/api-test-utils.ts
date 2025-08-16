import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

// Utility functions for API testing

export const mockApiCall = (
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  response: any,
  status = 200,
) => {
  server.use(
    http[method](url, () => {
      return HttpResponse.json(response, { status });
    }),
  );
};

export const mockApiError = (
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  status = 500,
  message = "Internal Server Error",
) => {
  server.use(
    http[method](url, () => {
      return HttpResponse.json({ error: message }, { status });
    }),
  );
};

export const mockApiDelay = (
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  response: any,
  delay = 1000,
) => {
  server.use(
    http[method](url, async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return HttpResponse.json(response);
    }),
  );
};

// Common API responses
export const createSuccessResponse = (data: any, pagination?: any) => ({
  data,
  ...(pagination && { pagination }),
});

export const createErrorResponse = (message: string, code?: string) => ({
  error: message,
  ...(code && { code }),
});

export const createPaginationMeta = (total: number, page = 1, limit = 10) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

// Ingredient API helpers
export const mockIngredientsApi = {
  getAll: (ingredients: any[], pagination?: any) =>
    mockApiCall(
      "get",
      "/api/v1/ingredients",
      createSuccessResponse(ingredients, pagination),
    ),

  getById: (id: string, ingredient: any) =>
    mockApiCall(
      "get",
      `/api/v1/ingredients/${id}`,
      createSuccessResponse(ingredient),
    ),

  create: (ingredient: any) =>
    mockApiCall(
      "post",
      "/api/v1/ingredients",
      createSuccessResponse(ingredient),
      201,
    ),

  update: (id: string, ingredient: any) =>
    mockApiCall(
      "put",
      `/api/v1/ingredients/${id}`,
      createSuccessResponse(ingredient),
    ),

  delete: (id: string) =>
    mockApiCall("delete", `/api/v1/ingredients/${id}`, { success: true }),

  error: (status = 500, message = "Internal Server Error") =>
    mockApiError("get", "/api/v1/ingredients", status, message),
};

// Dish API helpers
export const mockDishesApi = {
  getAll: (dishes: any[], pagination?: any) =>
    mockApiCall(
      "get",
      "/api/v1/dishes",
      createSuccessResponse(dishes, pagination),
    ),

  getById: (id: string, dish: any) =>
    mockApiCall("get", `/api/v1/dishes/${id}`, createSuccessResponse(dish)),

  create: (dish: any) =>
    mockApiCall("post", "/api/v1/dishes", createSuccessResponse(dish), 201),

  update: (id: string, dish: any) =>
    mockApiCall("put", `/api/v1/dishes/${id}`, createSuccessResponse(dish)),

  delete: (id: string) =>
    mockApiCall("delete", `/api/v1/dishes/${id}`, { success: true }),

  error: (status = 500, message = "Internal Server Error") =>
    mockApiError("get", "/api/v1/dishes", status, message),
};

// Unit API helpers
export const mockUnitsApi = {
  getAll: (units: any[], pagination?: any) =>
    mockApiCall(
      "get",
      "/api/v1/units",
      createSuccessResponse(units, pagination),
    ),

  getGrouped: (groupedUnits: any) =>
    mockApiCall(
      "get",
      "/api/v1/units/grouped",
      createSuccessResponse(groupedUnits),
    ),
};

// Tag API helpers
export const mockTagsApi = {
  getAll: (tags: any[], pagination?: any) =>
    mockApiCall("get", "/api/v1/tags", createSuccessResponse(tags, pagination)),

  create: (tag: any) =>
    mockApiCall("post", "/api/v1/tags", createSuccessResponse(tag), 201),
};

// Category API helpers
export const mockCategoriesApi = {
  ingredients: (categories: any[]) =>
    mockApiCall(
      "get",
      "/api/v1/ingredients/categories",
      createSuccessResponse(categories),
    ),

  dishes: (categories: any[]) =>
    mockApiCall(
      "get",
      "/api/v1/dishes/categories",
      createSuccessResponse(categories),
    ),

  tags: (categories: any[]) =>
    mockApiCall(
      "get",
      "/api/v1/tags/categories",
      createSuccessResponse(categories),
    ),
};

// Authentication helpers
export const mockAuthApi = {
  validSession: (session: any) =>
    mockApiCall("get", "/api/auth/session", session),

  noSession: () => mockApiCall("get", "/api/auth/session", null),

  invalidSession: () =>
    mockApiError("get", "/api/auth/session", 401, "Unauthorized"),
};

// Batch operations helpers
export const mockBatchApi = {
  ingredients: (results: any[]) =>
    mockApiCall("post", "/api/v1/ingredients/batch", { results }),

  dishes: (results: any[]) =>
    mockApiCall("post", "/api/v1/dishes/batch", { results }),
};

// Menu API helpers
export const mockMenusApi = {
  getAll: (menus: any[], pagination?: any) =>
    mockApiCall(
      "get",
      "/api/v1/menus",
      createSuccessResponse(menus, pagination),
    ),

  getById: (id: string, menu: any) =>
    mockApiCall("get", `/api/v1/menus/${id}`, createSuccessResponse(menu)),

  create: (menu: any) =>
    mockApiCall("post", "/api/v1/menus", createSuccessResponse(menu), 201),

  update: (id: string, menu: any) =>
    mockApiCall("put", `/api/v1/menus/${id}`, createSuccessResponse(menu)),

  delete: (id: string) =>
    mockApiCall("delete", `/api/v1/menus/${id}`, { success: true }),
};
