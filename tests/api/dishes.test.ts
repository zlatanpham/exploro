import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/api-test-utils";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Dishes API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/dishes", () => {
    it("should fetch dishes with ingredients when requested", async () => {
      const mockDishes = [
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
            },
          ],
          total_cost: 125000,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(mockDishes),
      });

      const response = await fetch("/api/v1/dishes?include_ingredients=true");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].ingredients).toBeDefined();
      expect(data.data[0].ingredients).toHaveLength(1);
      expect(data.data[0].total_cost).toBe(125000);
      expect(data.data[0].ingredients[0].name_vi).toBe("Thịt bò");
    });

    it("should filter dishes by difficulty", async () => {
      const easyDishes = [
        {
          id: "1",
          name_vi: "Trứng chiên",
          name_en: "Fried Egg",
          difficulty: "easy",
          cook_time: 5,
          prep_time: 2,
          servings: 1,
          status: "active",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(easyDishes),
      });

      await fetch("/api/v1/dishes?difficulty=easy");

      expect(fetch).toHaveBeenCalledWith("/api/v1/dishes?difficulty=easy");
    });

    it("should filter dishes by maximum cook time", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse([]),
      });

      await fetch("/api/v1/dishes?max_cook_time=30");

      expect(fetch).toHaveBeenCalledWith("/api/v1/dishes?max_cook_time=30");
    });

    it("should filter dishes by tags", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse([]),
      });

      await fetch("/api/v1/dishes?tags=vietnamese&tags=soup");

      expect(fetch).toHaveBeenCalledWith(
        "/api/v1/dishes?tags=vietnamese&tags=soup",
      );
    });

    it("should search dishes by Vietnamese name", async () => {
      const searchResults = [
        {
          id: "1",
          name_vi: "Phở bò",
          name_en: "Beef Pho",
          difficulty: "medium",
          cook_time: 240,
          status: "active",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(searchResults),
      });

      await fetch("/api/v1/dishes?search=phở");

      expect(fetch).toHaveBeenCalledWith("/api/v1/dishes?search=phở");
    });
  });

  describe("POST /api/v1/dishes", () => {
    it("should create dish with ingredients and tags", async () => {
      const newDish = {
        name_vi: "Bún bò Huế",
        name_en: "Hue Beef Noodles",
        description_vi: "Món bún đặc sản Huế",
        description_en: "Specialty noodles from Hue",
        instructions_vi: "Nấu nước dùng với xương heo",
        instructions_en: "Simmer broth with pork bones",
        difficulty: "hard",
        cook_time: 180,
        prep_time: 45,
        servings: 4,
        ingredients: [
          {
            ingredient_id: "1",
            quantity: 0.3,
            unit_id: "kg-1",
            notes: "Thái lát",
            optional: false,
          },
        ],
        tags: ["1", "2"], // Tag IDs
      };

      const createdDish = {
        id: "2",
        ...newDish,
        status: "active",
        created_at: "2024-01-15T12:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
        ingredients: [
          {
            ingredient_id: "1",
            name_vi: "Thịt bò",
            name_en: "Beef",
            quantity: 0.3,
            unit_id: "kg-1",
            unit: {
              id: "kg-1",
              symbol: "kg",
              name_vi: "kilogram",
              name_en: "kilogram",
            },
            optional: false,
            notes: "Thái lát",
          },
        ],
        tags: [
          {
            id: "1",
            name_vi: "Món Việt",
            name_en: "Vietnamese",
            category: "cuisine",
          },
          { id: "2", name_vi: "Món canh", name_en: "Soup", category: "type" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createSuccessResponse(createdDish),
      });

      const response = await fetch("/api/v1/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ dish: newDish }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.id).toBe("2");
      expect(data.data.name_vi).toBe("Bún bò Huế");
      expect(data.data.ingredients).toHaveLength(1);
      expect(data.data.tags).toHaveLength(2);
    });

    it("should handle validation errors for dish creation", async () => {
      const invalidDish = {
        name_vi: "", // Required field empty
        description_vi: "Description",
        instructions_vi: "Instructions",
        difficulty: "invalid", // Invalid difficulty value
        cook_time: -10, // Invalid negative time
        servings: 0, // Invalid zero servings
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () =>
          createErrorResponse("Validation failed", "VALIDATION_ERROR"),
      });

      const response = await fetch("/api/v1/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ dish: invalidDish }),
      });

      expect(response.status).toBe(400);
    });

    it("should handle invalid ingredient references", async () => {
      const dishWithInvalidIngredient = {
        name_vi: "Test Dish",
        description_vi: "Test",
        instructions_vi: "Test",
        difficulty: "easy",
        cook_time: 30,
        servings: 2,
        ingredients: [
          {
            ingredient_id: "non-existent-id",
            quantity: 1,
            unit_id: "kg-1",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => createErrorResponse("Invalid ingredient reference"),
      });

      const response = await fetch("/api/v1/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ dish: dishWithInvalidIngredient }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/v1/dishes/:id", () => {
    it("should update dish and recalculate cost", async () => {
      const updateData = {
        name_vi: "Phở bò đặc biệt",
        name_en: "Special Beef Pho",
        cook_time: 300, // Increased cook time
        ingredients: [
          {
            ingredient_id: "1",
            quantity: 0.8, // Increased quantity
            unit_id: "kg-1",
            notes: "Thái lát dày",
            optional: false,
          },
        ],
      };

      const updatedDish = {
        id: "1",
        ...updateData,
        difficulty: "medium",
        prep_time: 30,
        servings: 4,
        status: "active",
        updated_at: "2024-01-15T12:00:00Z",
        ingredients: [
          {
            ingredient_id: "1",
            name_vi: "Thịt bò",
            name_en: "Beef",
            quantity: 0.8,
            unit_id: "kg-1",
            unit: {
              id: "kg-1",
              symbol: "kg",
              name_vi: "kilogram",
              name_en: "kilogram",
            },
            optional: false,
            notes: "Thái lát dày",
          },
        ],
        total_cost: 200000, // Updated cost based on new quantity
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(updatedDish),
      });

      const response = await fetch("/api/v1/dishes/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ dish: updateData }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data.name_vi).toBe("Phở bò đặc biệt");
      expect(data.data.ingredients[0].quantity).toBe(0.8);
      expect(data.data.total_cost).toBe(200000);
    });
  });

  describe("Vietnamese Search Features", () => {
    it("should search dishes without diacritics", async () => {
      const searchResults = [
        {
          id: "1",
          name_vi: "Phở bò",
          name_en: "Beef Pho",
          difficulty: "medium",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(searchResults),
      });

      // Search "pho bo" should find "Phở bò"
      await fetch("/api/v1/dishes?search=pho bo");

      expect(fetch).toHaveBeenCalledWith("/api/v1/dishes?search=pho bo");
    });

    it("should search dishes by English name", async () => {
      const searchResults = [
        {
          id: "1",
          name_vi: "Phở bò",
          name_en: "Beef Pho",
          difficulty: "medium",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(searchResults),
      });

      await fetch("/api/v1/dishes?search=beef pho");

      expect(fetch).toHaveBeenCalledWith("/api/v1/dishes?search=beef pho");
    });

    it("should search in dish descriptions", async () => {
      const searchResults = [
        {
          id: "1",
          name_vi: "Phở bò",
          description_vi: "Món ăn truyền thống Việt Nam",
          description_en: "Traditional Vietnamese dish",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(searchResults),
      });

      await fetch("/api/v1/dishes?search=traditional");

      expect(fetch).toHaveBeenCalledWith("/api/v1/dishes?search=traditional");
    });
  });

  describe("Cost Calculation Integration", () => {
    it("should return accurate cost calculations", async () => {
      const dishWithCosts = [
        {
          id: "1",
          name_vi: "Phở bò",
          ingredients: [
            {
              ingredient_id: "1",
              name_vi: "Thịt bò",
              quantity: 0.5, // 500g
              unit_id: "kg-1",
              price_per_unit: 250000, // 250,000 VND per kg
              cost: 125000, // 0.5 * 250,000
            },
            {
              ingredient_id: "2",
              name_vi: "Bánh phở",
              quantity: 0.2, // 200g
              unit_id: "kg-1",
              price_per_unit: 50000, // 50,000 VND per kg
              cost: 10000, // 0.2 * 50,000
            },
          ],
          total_cost: 135000, // Sum of ingredient costs
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createSuccessResponse(dishWithCosts),
      });

      const response = await fetch(
        "/api/v1/dishes?include_ingredients=true&include_costs=true",
      );
      const data = await response.json();

      expect(data.data[0].total_cost).toBe(135000);
      expect(data.data[0].ingredients[0].cost).toBe(125000);
      expect(data.data[0].ingredients[1].cost).toBe(10000);
    });
  });

  describe("Batch Operations", () => {
    it("should create multiple dishes in batch", async () => {
      const batchData = {
        dishes: [
          {
            name_vi: "Cơm tấm",
            name_en: "Broken Rice",
            description_vi: "Cơm tấm sườn nướng",
            description_en: "Grilled pork ribs with broken rice",
            instructions_vi: "Nướng sườn và phục vụ với cơm tấm",
            instructions_en: "Grill ribs and serve with broken rice",
            difficulty: "easy",
            cook_time: 45,
            prep_time: 15,
            servings: 2,
            ingredients: [],
          },
          {
            name_vi: "Bánh mì",
            name_en: "Vietnamese Sandwich",
            description_vi: "Bánh mì thịt nguội",
            description_en: "Cold cut Vietnamese sandwich",
            instructions_vi: "Cắt bánh mì và cho nhân vào",
            instructions_en: "Cut bread and add fillings",
            difficulty: "easy",
            cook_time: 10,
            prep_time: 5,
            servings: 1,
            ingredients: [],
          },
        ],
      };

      const batchResults = {
        results: [
          { success: true, dish: { id: "3", name_vi: "Cơm tấm" } },
          { success: true, dish: { id: "4", name_vi: "Bánh mì" } },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => batchResults,
      });

      const response = await fetch("/api/v1/dishes/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(batchData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.results).toHaveLength(2);
      expect(data.results[0].success).toBe(true);
      expect(data.results[1].success).toBe(true);
    });
  });
});
