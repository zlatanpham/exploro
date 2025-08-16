import { http, HttpResponse } from "msw";

// Mock data
export const mockIngredients = [
  {
    id: "1",
    name_vi: "Thịt bò",
    name_en: "Beef",
    category: "meat",
    current_price: 250000,
    unit_id: "kg-1",
    density: null,
    seasonal_flag: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name_vi: "Cà chua",
    name_en: "Tomato",
    category: "vegetables",
    current_price: 15000,
    unit_id: "kg-2",
    density: 1.0,
    seasonal_flag: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockDishes = [
  {
    id: "1",
    name_vi: "Phở bò",
    name_en: "Beef Pho",
    description_vi: "Món phở truyền thống với thịt bò",
    description_en: "Traditional pho with beef",
    instructions_vi: "Nấu nước dùng trong 4 giờ",
    instructions_en: "Simmer broth for 4 hours",
    difficulty: "medium",
    cook_time: 240,
    prep_time: 30,
    servings: 4,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockUnits = [
  {
    id: "kg-1",
    symbol: "kg",
    name_vi: "kilogram",
    name_en: "kilogram",
    category_id: "mass-1",
    factor_to_base: 1.0,
    is_base_unit: true,
  },
  {
    id: "g-1",
    symbol: "g",
    name_vi: "gram",
    name_en: "gram",
    category_id: "mass-1",
    factor_to_base: 0.001,
    is_base_unit: false,
  },
];

export const mockTags = [
  {
    id: "1",
    name_vi: "Món Việt",
    name_en: "Vietnamese",
    category: "cuisine",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name_vi: "Món nướng",
    name_en: "Grilled",
    category: "cooking_method",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// API handlers
export const handlers = [
  // Ingredients API
  http.get("/api/v1/ingredients", () => {
    return HttpResponse.json({
      data: mockIngredients,
      pagination: {
        total: mockIngredients.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/v1/ingredients/:id", ({ params }) => {
    const ingredient = mockIngredients.find((ing) => ing.id === params.id);
    if (!ingredient) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ data: ingredient });
  }),

  http.post("/api/v1/ingredients", async ({ request }) => {
    const body = await request.json();
    const newIngredient = {
      id: Math.random().toString(),
      ...body.ingredient,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newIngredient }, { status: 201 });
  }),

  // Dishes API
  http.get("/api/v1/dishes", () => {
    return HttpResponse.json({
      data: mockDishes,
      pagination: {
        total: mockDishes.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/v1/dishes/:id", ({ params }) => {
    const dish = mockDishes.find((d) => d.id === params.id);
    if (!dish) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ data: dish });
  }),

  http.post("/api/v1/dishes", async ({ request }) => {
    const body = await request.json();
    const newDish = {
      id: Math.random().toString(),
      ...body.dish,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newDish }, { status: 201 });
  }),

  // Units API
  http.get("/api/v1/units", () => {
    return HttpResponse.json({
      data: mockUnits,
      pagination: {
        total: mockUnits.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // Tags API
  http.get("/api/v1/tags", () => {
    return HttpResponse.json({
      data: mockTags,
      pagination: {
        total: mockTags.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // Categories API
  http.get("/api/v1/ingredients/categories", () => {
    return HttpResponse.json({
      data: [
        { value: "meat", label: "Meat", name_vi: "Thịt", name_en: "Meat" },
        {
          value: "vegetables",
          label: "Vegetables",
          name_vi: "Rau củ",
          name_en: "Vegetables",
        },
        {
          value: "spices",
          label: "Spices",
          name_vi: "Gia vị",
          name_en: "Spices",
        },
      ],
    });
  }),

  http.get("/api/v1/dishes/categories", () => {
    return HttpResponse.json({
      data: [
        {
          value: "main",
          label: "Main Course",
          name_vi: "Món chính",
          name_en: "Main Course",
        },
        { value: "soup", label: "Soup", name_vi: "Canh", name_en: "Soup" },
        {
          value: "appetizer",
          label: "Appetizer",
          name_vi: "Khai vị",
          name_en: "Appetizer",
        },
      ],
    });
  }),

  // Auth API mock (for testing protected routes)
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // Error handling examples
  http.get("/api/v1/ingredients/error", () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get("/api/v1/dishes/not-found", () => {
    return new HttpResponse(null, { status: 404 });
  }),
];
