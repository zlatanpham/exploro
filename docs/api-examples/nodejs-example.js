// @ts-nocheck
/**
 * Exploro API Integration Example - Node.js
 *
 * This example demonstrates how to use the Exploro API to:
 * 1. List existing ingredients (for deduplication)
 * 2. Create new ingredients
 * 3. Create dishes with ingredient associations
 * 4. Handle errors and rate limiting
 */

const API_KEY = "sk_live_your_api_key_here";
const API_BASE_URL = "https://exploro.app/api/v1";

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Extract rate limit info from headers
  const rateLimit = {
    limit: response.headers.get("X-RateLimit-Limit"),
    remaining: response.headers.get("X-RateLimit-Remaining"),
    reset: response.headers.get("X-RateLimit-Reset"),
  };

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${data.error?.message || "Unknown error"}`);
  }

  return { data, rateLimit };
}

// Example 1: Search for existing ingredients to avoid duplicates
async function searchIngredients(searchTerm) {
  try {
    const { data, rateLimit } = await makeRequest(
      `/ingredients?search=${encodeURIComponent(searchTerm)}`,
    );

    console.log(`Found ${data.total} ingredients matching "${searchTerm}"`);
    console.log(
      `Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`,
    );

    return data.ingredients;
  } catch (error) {
    console.error("Error searching ingredients:", error.message);
    return [];
  }
}

// Example 2: Create a single ingredient
async function createIngredient(ingredient) {
  try {
    const { data } = await makeRequest("/ingredients", {
      method: "POST",
      body: JSON.stringify({ ingredient }),
    });

    if (data.duplicate_found) {
      console.log(
        `Ingredient "${ingredient.name_vi}" already exists with ID: ${data.ingredient.id}`,
      );
    } else {
      console.log(
        `Created ingredient "${ingredient.name_vi}" with ID: ${data.ingredient.id}`,
      );
    }

    return data.ingredient;
  } catch (error) {
    console.error("Error creating ingredient:", error.message);
    return null;
  }
}

// Example 3: Batch create ingredients
async function batchCreateIngredients(ingredients) {
  try {
    const { data } = await makeRequest("/ingredients/batch", {
      method: "POST",
      body: JSON.stringify({ ingredients }),
    });

    console.log(
      `Batch results: ${data.summary.created} created, ${data.summary.existing} existing, ${data.summary.failed} failed`,
    );

    // Log any failures
    data.results.forEach((result) => {
      if (!result.success) {
        console.error(
          `Failed to create ${result.ingredient_name}: ${result.error}`,
        );
      }
    });

    return data.results;
  } catch (error) {
    console.error("Error in batch creation:", error.message);
    return [];
  }
}

// Example 4: Create a dish with ingredients
async function createDish(dishData) {
  try {
    const { data } = await makeRequest("/dishes", {
      method: "POST",
      body: JSON.stringify(dishData),
    });

    console.log(`Created dish "${data.dish.name_vi}" with ID: ${data.dish.id}`);
    console.log(`Total cost: ${data.dish.total_cost} VND`);

    return data.dish;
  } catch (error) {
    console.error("Error creating dish:", error.message);
    return null;
  }
}

// Example usage workflow
async function main() {
  console.log("=== Exploro API Integration Example ===\n");

  // Step 1: Check for existing ingredients
  console.log("1. Checking for existing beef ingredient...");
  const beefIngredients = await searchIngredients("Thịt bò");

  let beefId;
  if (beefIngredients.length > 0) {
    beefId = beefIngredients[0].id;
    console.log(`   Found existing beef ingredient with ID: ${beefId}`);
  } else {
    // Create beef ingredient if it doesn't exist
    console.log("   No beef ingredient found, creating new one...");
    const beef = await createIngredient({
      name_vi: "Thịt bò",
      name_en: "Beef",
      category: "meat",
      default_unit: "kg",
      current_price: 280000,
    });
    beefId = beef?.id;
  }

  // Step 2: Batch create multiple ingredients
  console.log("\n2. Batch creating vegetables...");
  const vegetableResults = await batchCreateIngredients([
    {
      name_vi: "Hành tím",
      name_en: "Shallot",
      category: "vegetables",
      default_unit: "kg",
      current_price: 40000,
    },
    {
      name_vi: "Tỏi",
      name_en: "Garlic",
      category: "vegetables",
      default_unit: "kg",
      current_price: 35000,
    },
    {
      name_vi: "Sả",
      name_en: "Lemongrass",
      category: "vegetables",
      default_unit: "kg",
      current_price: 20000,
    },
  ]);

  // Extract ingredient IDs from results
  const ingredientIds = vegetableResults
    .filter((r) => r.success)
    .map((r) => r.ingredient.id);

  // Step 3: Create a dish using the ingredients
  if (beefId && ingredientIds.length > 0) {
    console.log("\n3. Creating Phở Bò dish...");

    const phoBo = await createDish({
      dish: {
        name_vi: "Phở Bò",
        name_en: "Beef Pho",
        description_vi: "Món phở truyền thống Việt Nam với nước dùng thơm ngon",
        description_en: "Traditional Vietnamese pho with fragrant broth",
        instructions_vi:
          "Ninh xương bò trong 6 giờ. Nướng hành và gừng. Thêm gia vị...",
        instructions_en:
          "Simmer beef bones for 6 hours. Char onions and ginger...",
        difficulty: "medium",
        cook_time: 360, // 6 hours
        prep_time: 30,
        servings: 4,
        status: "active",
      },
      ingredients: [
        {
          ingredient_id: beefId,
          quantity: 0.5,
          unit: "kg",
          optional: false,
        },
        {
          ingredient_id: ingredientIds[0], // Shallot
          quantity: 0.2,
          unit: "kg",
          optional: false,
        },
        {
          ingredient_id: ingredientIds[1], // Garlic
          quantity: 0.05,
          unit: "kg",
          optional: false,
        },
        {
          ingredient_id: ingredientIds[2], // Lemongrass
          quantity: 0.02,
          unit: "kg",
          optional: true,
          notes: "For extra fragrance",
        },
      ],
      tags: [], // Add tag IDs if needed
    });

    if (phoBo) {
      console.log("\n✅ Successfully created dish with ingredients!");
    }
  }

  // Step 4: List all dishes with ingredients
  console.log("\n4. Fetching dishes with full ingredient details...");
  try {
    const { data } = await makeRequest(
      "/dishes?include_ingredients=true&limit=5",
    );

    console.log(
      `\nFound ${data.total} dishes. Showing first ${data.dishes.length}:`,
    );
    data.dishes.forEach((dish) => {
      console.log(`\n- ${dish.name_vi} (${dish.name_en || "N/A"})`);
      console.log(
        `  Difficulty: ${dish.difficulty}, Cook time: ${dish.cook_time} mins`,
      );
      console.log(`  Total cost: ${dish.total_cost} VND`);
      console.log(`  Ingredients: ${dish.ingredients?.length || 0}`);
    });
  } catch (error) {
    console.error("Error fetching dishes:", error.message);
  }
}

// Run the example
main().catch(console.error);
