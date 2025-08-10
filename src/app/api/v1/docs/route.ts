import { type NextRequest, NextResponse } from "next/server";

const apiDocumentation = {
  openapi: "3.0.0",
  info: {
    title: "Exploro API",
    version: "1.0.0",
    description:
      "API for managing culinary data including ingredients, dishes, menus, and tags",
    contact: {
      email: "api@exploro.app",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "API Key",
        description: "Use your API key in the format: Bearer sk_live_...",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                enum: [
                  "INVALID_API_KEY",
                  "PERMISSION_DENIED",
                  "RATE_LIMIT_EXCEEDED",
                  "DUPLICATE_INGREDIENT",
                  "INGREDIENT_NOT_FOUND",
                  "VALIDATION_ERROR",
                  "ORGANIZATION_MISMATCH",
                  "INTERNAL_ERROR",
                ],
              },
              message: { type: "string" },
              details: { type: "object" },
              request_id: { type: "string" },
            },
          },
        },
      },
      Ingredient: {
        type: "object",
        properties: {
          id: { type: "string" },
          name_vi: { type: "string" },
          name_en: { type: "string", nullable: true },
          category: { type: "string" },
          default_unit: { type: "string" },
          current_price: { type: "number" },
          seasonal_flag: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Dish: {
        type: "object",
        properties: {
          id: { type: "string" },
          name_vi: { type: "string" },
          name_en: { type: "string", nullable: true },
          description_vi: { type: "string" },
          description_en: { type: "string", nullable: true },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          cook_time: { type: "integer" },
          prep_time: { type: "integer" },
          servings: { type: "integer" },
          image_url: { type: "string", nullable: true },
          source_url: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Tag: {
        type: "object",
        properties: {
          id: { type: "string" },
          name_vi: { type: "string" },
          name_en: { type: "string", nullable: true },
          category: { type: "string", nullable: true },
          usage_count: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/ingredients": {
      get: {
        summary: "List ingredients",
        description: "Retrieve a list of ingredients with optional filtering",
        tags: ["Ingredients"],
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Search in Vietnamese and English names",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            description: "Filter by ingredient category",
            schema: { type: "string" },
          },
          {
            name: "seasonal",
            in: "query",
            description: "Filter seasonal ingredients",
            schema: { type: "boolean" },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of results to return (default: 50, max: 200)",
            schema: { type: "integer", default: 50 },
          },
          {
            name: "offset",
            in: "query",
            description: "Number of results to skip",
            schema: { type: "integer", default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "List of ingredients",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ingredients: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Ingredient" },
                    },
                    total: { type: "integer" },
                    limit: { type: "integer" },
                    offset: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create ingredient",
        description:
          "Create a new ingredient with automatic duplicate detection",
        tags: ["Ingredients"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ingredient"],
                properties: {
                  ingredient: {
                    type: "object",
                    required: [
                      "name_vi",
                      "category",
                      "default_unit",
                      "current_price",
                    ],
                    properties: {
                      name_vi: { type: "string" },
                      name_en: { type: "string" },
                      category: { type: "string" },
                      default_unit: { type: "string" },
                      current_price: { type: "number" },
                      seasonal_flag: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Ingredient created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    duplicate_found: { type: "boolean" },
                    ingredient: { $ref: "#/components/schemas/Ingredient" },
                  },
                },
              },
            },
          },
          "200": {
            description: "Duplicate ingredient found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    duplicate_found: { type: "boolean" },
                    ingredient: { $ref: "#/components/schemas/Ingredient" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/ingredients/batch": {
      post: {
        summary: "Batch create ingredients",
        description: "Create up to 50 ingredients in a single request",
        tags: ["Ingredients"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ingredients"],
                properties: {
                  ingredients: {
                    type: "array",
                    minItems: 1,
                    maxItems: 50,
                    items: {
                      type: "object",
                      required: [
                        "name_vi",
                        "category",
                        "default_unit",
                        "current_price",
                      ],
                      properties: {
                        name_vi: { type: "string" },
                        name_en: { type: "string" },
                        category: { type: "string" },
                        default_unit: { type: "string" },
                        current_price: { type: "number" },
                        seasonal_flag: { type: "boolean" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "207": {
            description: "Multi-status response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        created: { type: "integer" },
                        existing: { type: "integer" },
                        failed: { type: "integer" },
                      },
                    },
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          success: { type: "boolean" },
                          created: { type: "boolean" },
                          ingredient: {
                            $ref: "#/components/schemas/Ingredient",
                          },
                          message: { type: "string" },
                          error: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/dishes": {
      get: {
        summary: "List dishes",
        description: "Retrieve a list of dishes with optional filtering",
        tags: ["Dishes"],
        parameters: [
          {
            name: "status",
            in: "query",
            description: "Filter by status",
            schema: { type: "string", enum: ["active", "inactive", "all"] },
          },
          {
            name: "difficulty",
            in: "query",
            description: "Filter by difficulty",
            schema: { type: "string", enum: ["easy", "medium", "hard"] },
          },
          {
            name: "max_cook_time",
            in: "query",
            description: "Maximum cooking time in minutes",
            schema: { type: "integer" },
          },
          {
            name: "tags",
            in: "query",
            description: "Filter by tag IDs (can be repeated)",
            schema: { type: "array", items: { type: "string" } },
          },
          {
            name: "search",
            in: "query",
            description: "Search in names and descriptions",
            schema: { type: "string" },
          },
          {
            name: "include_ingredients",
            in: "query",
            description: "Include full ingredient details",
            schema: { type: "boolean" },
          },
        ],
        responses: {
          "200": {
            description: "List of dishes",
          },
        },
      },
      post: {
        summary: "Create dish",
        description: "Create a new dish with ingredient associations",
        tags: ["Dishes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["dish", "ingredients"],
                properties: {
                  dish: {
                    type: "object",
                    required: [
                      "name_vi",
                      "description_vi",
                      "instructions_vi",
                      "difficulty",
                      "cook_time",
                    ],
                  },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["ingredient_id", "quantity", "unit"],
                      properties: {
                        ingredient_id: { type: "string" },
                        quantity: { type: "number" },
                        unit: { type: "string" },
                        optional: { type: "boolean" },
                        notes: { type: "string" },
                      },
                    },
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Dish created successfully",
          },
        },
      },
    },
    "/tags": {
      get: {
        summary: "List tags",
        description: "Retrieve all available tags",
        tags: ["Tags"],
        parameters: [
          {
            name: "category",
            in: "query",
            description: "Filter by tag category",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "List of tags",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Ingredients",
      description: "Ingredient management endpoints",
    },
    {
      name: "Dishes",
      description: "Dish management endpoints",
    },
    {
      name: "Menus",
      description: "Menu management endpoints",
    },
    {
      name: "Tags",
      description: "Tag management endpoints",
    },
  ],
};

export async function GET(request: NextRequest) {
  return NextResponse.json(apiDocumentation);
}
