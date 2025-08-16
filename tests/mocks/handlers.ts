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
    ingredients: [
      {
        ingredient_id: "1",
        name_vi: "Thịt bò",
        name_en: "Beef",
        quantity: 0.5,
        unit_id: "kg-1",
        unit: {
          id: "kg-1",
          symbol: "kg",
          name_vi: "kilogram",
          name_en: "kilogram",
        },
        optional: false,
        notes: "Thái lát mỏng",
        cost: 125000,
      },
      {
        ingredient_id: "2",
        name_vi: "Hành tây",
        name_en: "Onion",
        quantity: 0.1,
        unit_id: "kg-1",
        unit: {
          id: "kg-1",
          symbol: "kg",
          name_vi: "kilogram",
          name_en: "kilogram",
        },
        optional: false,
        notes: "Cắt lát",
        cost: 10000,
      },
    ],
    total_cost: 135000,
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
  http.get("/api/v1/ingredients", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    let filteredIngredients = mockIngredients;

    // Vietnamese search simulation
    if (search) {
      if (search.toLowerCase() === "bot ngot") {
        filteredIngredients = [
          {
            id: "3",
            name_vi: "Bột ngọt",
            name_en: "MSG",
            category: "spices",
            current_price: 15000,
            unit_id: "g-1",
            density: null,
            seasonal_flag: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      } else if (search.toLowerCase() === "beef pho") {
        filteredIngredients = [
          {
            id: "4",
            name_vi: "Phở bò",
            name_en: "Beef Pho",
            category: "soup",
            current_price: 50000,
            unit_id: "kg-1",
            density: null,
            seasonal_flag: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      } else if (
        search.toLowerCase().includes("thịt bò") ||
        search.toLowerCase().includes("thit bo")
      ) {
        filteredIngredients = [mockIngredients[0]]; // Return just the beef ingredient
      }
    }

    // Handle pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    return HttpResponse.json({
      data: filteredIngredients,
      pagination: {
        total: filteredIngredients.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(filteredIngredients.length / limit),
      },
    });
  }),

  http.get("/api/v1/ingredients/:id", ({ params }) => {
    const ingredient = mockIngredients.find((ing) => ing.id === params.id);
    if (!ingredient) {
      return HttpResponse.json(
        { error: "Ingredient not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: ingredient });
  }),

  http.post("/api/v1/ingredients", async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validation simulation
    if (
      !body.ingredient?.name_vi ||
      body.ingredient.name_vi === "" ||
      body.ingredient.current_price < 0
    ) {
      return HttpResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const newIngredient = {
      id: "3", // Fixed ID for predictable testing
      ...body.ingredient,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newIngredient }, { status: 201 });
  }),

  http.put("/api/v1/ingredients/:id", async ({ params, request }) => {
    const ingredient = mockIngredients.find((ing) => ing.id === params.id);
    if (!ingredient) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = await request.json();
    const updatedIngredient = {
      ...ingredient,
      ...body.ingredient,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: updatedIngredient });
  }),

  http.delete("/api/v1/ingredients/:id", ({ params, request }) => {
    const ingredient = mockIngredients.find((ing) => ing.id === params.id);
    if (!ingredient) {
      return new HttpResponse(null, { status: 404 });
    }

    // Check authorization header for permission simulation
    const authHeader = request.headers.get("authorization");
    if (authHeader?.includes("user-token")) {
      return HttpResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return HttpResponse.json({ success: true });
  }),

  // Dishes API
  http.get("/api/v1/dishes", ({ request }) => {
    const url = new URL(request.url);
    const difficulty = url.searchParams.get("difficulty");
    const search = url.searchParams.get("search");

    let filteredDishes = mockDishes;

    // Filter by difficulty
    if (difficulty === "easy") {
      filteredDishes = [
        {
          id: "2",
          name_vi: "Trứng chiên",
          name_en: "Fried Egg",
          difficulty: "easy",
          cook_time: 5,
          prep_time: 2,
          servings: 1,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    // Search functionality
    if (search) {
      if (
        search.toLowerCase().includes("pho") ||
        search.toLowerCase().includes("bo")
      ) {
        filteredDishes = mockDishes; // Return pho dish
      } else if (search.toLowerCase().includes("traditional")) {
        filteredDishes = mockDishes; // Return pho dish which has traditional in description
      }
    }

    return HttpResponse.json({
      data: filteredDishes,
      pagination: {
        total: filteredDishes.length,
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

    // Validation simulation
    if (!body.dish?.name_vi || body.dish.name_vi === "") {
      return HttpResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    // Check for invalid ingredient references
    if (
      body.dish?.ingredients?.some(
        (ing: any) => ing.ingredient_id === "non-existent-id",
      )
    ) {
      return HttpResponse.json(
        { error: "Invalid ingredient reference", code: "INVALID_REFERENCE" },
        { status: 400 },
      );
    }

    const newDish = {
      id: "2", // Fixed ID for predictable testing
      ...body.dish,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newDish }, { status: 201 });
  }),

  http.put("/api/v1/dishes/:id", async ({ params, request }) => {
    const dish = mockDishes.find((d) => d.id === params.id);
    if (!dish) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = await request.json();
    const updatedDish = {
      ...dish,
      ...body.dish,
      updated_at: new Date().toISOString(),
      total_cost: 200000, // Simulated recalculated cost
    };
    return HttpResponse.json({ data: updatedDish });
  }),

  http.delete("/api/v1/dishes/:id", ({ params, request }) => {
    const dish = mockDishes.find((d) => d.id === params.id);
    if (!dish) {
      return new HttpResponse(null, { status: 404 });
    }

    // Check authorization header for permission simulation
    const authHeader = request.headers.get("authorization");
    if (authHeader?.includes("user-token")) {
      return HttpResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return HttpResponse.json({ success: true });
  }),

  http.post("/api/v1/dishes/batch", async ({ request }) => {
    const body = await request.json();
    const results = body.dishes.map((dish: any) => ({
      success: true,
      data: {
        id: Math.random().toString(),
        ...dish,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
    return HttpResponse.json({ results }, { status: 201 });
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
