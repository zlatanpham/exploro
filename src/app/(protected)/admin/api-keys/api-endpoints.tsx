export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  example?: any;
}

export interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  parameters?: Parameter[];
  requestBody?: any;
  response?: any;
  examples: {
    curl: string;
    python: string;
    javascript: string;
  };
}

export const getEndpoints = (origin: string): Endpoint[] => [
  {
    id: "get-ingredient-categories",
    method: "GET",
    path: "/api/v1/ingredients/categories",
    description: "List all available ingredient categories",
    response: {
      categories: [
        {
          value: "vegetables",
          name_vi: "Rau củ",
          name_en: "Vegetables",
          description: "Fresh vegetables and root vegetables",
        },
        {
          value: "meat",
          name_vi: "Thịt",
          name_en: "Meat",
          description: "All types of meat including beef, pork, chicken",
        },
        // ... more categories
      ],
      total: 9,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/ingredients/categories" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/ingredients/categories",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/ingredients/categories', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "get-ingredient-units",
    method: "GET",
    path: "/api/v1/ingredients/units",
    description: "List all available ingredient units",
    parameters: [
      {
        name: "category",
        type: "string",
        required: false,
        description:
          "Filter by unit category (mass, volume, count, bundle, cooking)",
      },
      {
        name: "grouped",
        type: "boolean",
        required: false,
        description: "Group units by category",
      },
    ],
    response: {
      units: [
        {
          value: "kg",
          name_vi: "Kilogram",
          name_en: "Kilogram",
          symbol: "kg",
          category: "mass",
          base_unit: true,
          factor_to_base: 1,
        },
        {
          value: "g",
          name_vi: "Gram",
          name_en: "Gram",
          symbol: "g",
          category: "mass",
          base_unit: false,
          factor_to_base: 0.001,
        },
        // ... more units
      ],
      total: 20,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/ingredients/units?category=mass" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/ingredients/units",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    params={"category": "mass", "grouped": True}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/ingredients/units?category=mass&grouped=true', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "get-dish-categories",
    method: "GET",
    path: "/api/v1/dishes/categories",
    description:
      "List all dish category options (difficulty, status, meal groups)",
    parameters: [
      {
        name: "type",
        type: "string",
        required: false,
        description:
          "Get specific category type (difficulty, status, meal_groups)",
      },
    ],
    response: {
      categories: {
        difficulty: [
          {
            value: "easy",
            name_vi: "Dễ",
            name_en: "Easy",
            description:
              "Simple dishes that can be prepared quickly with basic techniques",
          },
          {
            value: "medium",
            name_vi: "Trung bình",
            name_en: "Medium",
            description: "Dishes requiring moderate skill and preparation time",
          },
          {
            value: "hard",
            name_vi: "Khó",
            name_en: "Hard",
            description:
              "Complex dishes requiring advanced techniques and longer preparation",
          },
        ],
        status: [
          {
            value: "active",
            name_vi: "Đang sử dụng",
            name_en: "Active",
            description: "Dish is currently available and in use",
          },
          {
            value: "inactive",
            name_vi: "Không sử dụng",
            name_en: "Inactive",
            description: "Dish is archived or not currently available",
          },
        ],
        meal_groups: [
          {
            value: "breakfast",
            name_vi: "Bữa sáng",
            name_en: "Breakfast",
            description: "Morning meal dishes",
          },
          {
            value: "lunch",
            name_vi: "Bữa trưa",
            name_en: "Lunch",
            description: "Midday meal dishes",
          },
          {
            value: "dinner",
            name_vi: "Bữa tối",
            name_en: "Dinner",
            description: "Evening meal dishes",
          },
          {
            value: "snack",
            name_vi: "Ăn vặt",
            name_en: "Snack",
            description: "Light dishes or appetizers",
          },
        ],
      },
      types: ["difficulty", "status", "meal_groups"],
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/dishes/categories?type=difficulty" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/dishes/categories",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    params={"type": "difficulty"}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/dishes/categories?type=difficulty', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "get-tag-categories",
    method: "GET",
    path: "/api/v1/tags/categories",
    description: "List all tag categories for dish classification",
    response: {
      categories: [
        {
          value: "cooking_method",
          name_vi: "Phương pháp nấu",
          name_en: "Cooking Method",
          description: "How the dish is prepared or cooked",
          examples: [
            "Món chiên (Fried)",
            "Món xào (Stir-fried)",
            "Món nướng (Grilled)",
          ],
        },
        {
          value: "meal_type",
          name_vi: "Loại bữa ăn",
          name_en: "Meal Type",
          description: "Type of meal or course",
          examples: [
            "Món chính (Main dish)",
            "Món phụ (Side dish)",
            "Món khai vị (Appetizer)",
          ],
        },
        {
          value: "cuisine",
          name_vi: "Ẩm thực vùng miền",
          name_en: "Cuisine",
          description: "Regional or cultural cuisine style",
          examples: [
            "Miền Bắc (Northern)",
            "Miền Trung (Central)",
            "Miền Nam (Southern)",
          ],
        },
        {
          value: "dietary",
          name_vi: "Chế độ ăn",
          name_en: "Dietary",
          description: "Dietary restrictions or preferences",
          examples: [
            "Món chay (Vegetarian)",
            "Thuần chay (Vegan)",
            "Không gluten (Gluten-free)",
          ],
        },
        // ... more categories
      ],
      total: 8,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/tags/categories" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/tags/categories",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/tags/categories', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "get-ingredients",
    method: "GET",
    path: "/api/v1/ingredients",
    description: "List ingredients with filtering and pagination",
    parameters: [
      {
        name: "search",
        type: "string",
        required: false,
        description: "Search in Vietnamese and English names",
      },
      {
        name: "category",
        type: "string",
        required: false,
        description:
          "Filter by ingredient category (vegetables, meat, seafood, spices, dairy, grains, fruits, sauces, other)",
      },
      {
        name: "seasonal",
        type: "boolean",
        required: false,
        description: "Filter seasonal ingredients",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Number of results (default: 50, max: 200)",
      },
      {
        name: "offset",
        type: "number",
        required: false,
        description: "Number of results to skip",
      },
    ],
    response: {
      ingredients: [
        {
          id: "uuid",
          name_vi: "Cà chua",
          name_en: "Tomato",
          category: "vegetable",
          default_unit: "kg",
          current_price: 25000,
          seasonal_flag: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ],
      total: 100,
      limit: 50,
      offset: 0,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/ingredients?search=tomato&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/ingredients",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    params={"search": "tomato", "limit": 10}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/ingredients?search=tomato&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "create-ingredient",
    method: "POST",
    path: "/api/v1/ingredients",
    description: "Create a new ingredient with duplicate detection",
    requestBody: {
      ingredient: {
        name_vi: "Cà chua", // Required
        name_en: "Tomato", // Optional
        category: "vegetables", // Required (see /api/v1/ingredients/categories)
        default_unit: "kg", // Required (see /api/v1/ingredients/units)
        current_price: 25000, // Required, must be positive
        seasonal_flag: false, // Optional, defaults to false
      },
    },
    response: {
      duplicate_found: false,
      ingredient: {
        id: "uuid",
        name_vi: "Cà chua",
        name_en: "Tomato",
        category: "vegetable",
        default_unit: "kg",
        current_price: 25000,
        seasonal_flag: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      message: "An ingredient with this Vietnamese name already exists", // Only if duplicate
    },
    examples: {
      curl: `curl -X POST "${origin}/api/v1/ingredients" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ingredient": {
      "name_vi": "Cà chua",
      "name_en": "Tomato",
      "category": "vegetable",
      "default_unit": "kg",
      "current_price": 25000,
      "seasonal_flag": false
    }
  }'`,
      python: `import requests

data = {
    "ingredient": {
        "name_vi": "Cà chua",
        "name_en": "Tomato",
        "category": "vegetable",
        "default_unit": "kg",
        "current_price": 25000,
        "seasonal_flag": False
    }
}

response = requests.post(
    "${origin}/api/v1/ingredients",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  ingredient: {
    name_vi: "Cà chua",
    name_en: "Tomato",
    category: "vegetable",
    default_unit: "kg",
    current_price: 25000,
    seasonal_flag: false
  }
};

const response = await fetch('${origin}/api/v1/ingredients', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
  {
    id: "get-ingredient",
    method: "GET",
    path: "/api/v1/ingredients/{id}",
    description: "Get single ingredient with price history",
    response: {
      ingredient: {
        id: "uuid",
        name_vi: "Cà chua",
        name_en: "Tomato",
        category: "vegetable",
        default_unit: "kg",
        current_price: 25000,
        seasonal_flag: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        price_history: [
          {
            price: 25000,
            recorded_at: "2024-01-01T00:00:00Z",
          },
        ],
      },
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/ingredients/uuid-here" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/ingredients/uuid-here",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/ingredients/uuid-here', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "update-ingredient",
    method: "PUT",
    path: "/api/v1/ingredients/{id}",
    description: "Update ingredient details",
    requestBody: {
      ingredient: {
        name_vi: "Cà chua bi", // Optional
        name_en: "Cherry Tomato", // Optional
        category: "vegetables", // Optional (see /api/v1/ingredients/categories)
        default_unit: "kg", // Optional (see /api/v1/ingredients/units)
        current_price: 30000, // Optional
        seasonal_flag: true, // Optional
      },
    },
    response: {
      ingredient: {
        id: "uuid",
        name_vi: "Cà chua bi",
        name_en: "Cherry Tomato",
        category: "vegetable",
        default_unit: "kg",
        current_price: 30000,
        seasonal_flag: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    },
    examples: {
      curl: `curl -X PUT "${origin}/api/v1/ingredients/uuid-here" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ingredient": {
      "current_price": 30000
    }
  }'`,
      python: `import requests

data = {
    "ingredient": {
        "current_price": 30000
    }
}

response = requests.put(
    "${origin}/api/v1/ingredients/uuid-here",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  ingredient: {
    current_price: 30000
  }
};

const response = await fetch('${origin}/api/v1/ingredients/uuid-here', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
  {
    id: "delete-ingredient",
    method: "DELETE",
    path: "/api/v1/ingredients/{id}",
    description: "Delete ingredient (requires admin permission)",
    response: {
      message: "Ingredient deleted successfully",
    },
    examples: {
      curl: `curl -X DELETE "${origin}/api/v1/ingredients/uuid-here" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.delete(
    "${origin}/api/v1/ingredients/uuid-here",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
result = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/ingredients/uuid-here', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const result = await response.json();`,
    },
  },
  {
    id: "batch-create-ingredients",
    method: "POST",
    path: "/api/v1/ingredients/batch",
    description: "Batch create up to 50 ingredients",
    requestBody: {
      ingredients: [
        {
          name_vi: "Cà chua", // Required
          name_en: "Tomato", // Optional
          category: "vegetable", // Required
          default_unit: "kg", // Required
          current_price: 25000, // Required, must be positive
          seasonal_flag: false, // Optional, defaults to false
        },
      ], // Array of 1-50 ingredients
    },
    response: {
      summary: {
        total: 2,
        created: 1,
        existing: 1,
        failed: 0,
      },
      results: [
        {
          success: true,
          created: true,
          ingredient: {
            id: "uuid",
            name_vi: "Cà chua",
            name_en: "Tomato",
            category: "vegetable",
            default_unit: "kg",
            current_price: 25000,
            seasonal_flag: false,
          },
        },
        {
          success: true,
          created: false,
          ingredient: {
            /* existing ingredient data */
          },
          message: "Ingredient already exists",
        },
      ],
    },
    examples: {
      curl: `curl -X POST "${origin}/api/v1/ingredients/batch" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ingredients": [
      {
        "name_vi": "Cà chua",
        "name_en": "Tomato",
        "category": "vegetable",
        "default_unit": "kg",
        "current_price": 25000
      },
      {
        "name_vi": "Hành tây",
        "name_en": "Onion",
        "category": "vegetable",
        "default_unit": "kg",
        "current_price": 20000
      }
    ]
  }'`,
      python: `import requests

data = {
    "ingredients": [
        {
            "name_vi": "Cà chua",
            "name_en": "Tomato",
            "category": "vegetable",
            "default_unit": "kg",
            "current_price": 25000
        },
        {
            "name_vi": "Hành tây",
            "name_en": "Onion",
            "category": "vegetable",
            "default_unit": "kg",
            "current_price": 20000
        }
    ]
}

response = requests.post(
    "${origin}/api/v1/ingredients/batch",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  ingredients: [
    {
      name_vi: "Cà chua",
      name_en: "Tomato",
      category: "vegetable",
      default_unit: "kg",
      current_price: 25000
    },
    {
      name_vi: "Hành tây",
      name_en: "Onion",
      category: "vegetable",
      default_unit: "kg",
      current_price: 20000
    }
  ]
};

const response = await fetch('${origin}/api/v1/ingredients/batch', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
  {
    id: "get-dishes",
    method: "GET",
    path: "/api/v1/dishes",
    description: "List dishes with filtering and pagination",
    parameters: [
      {
        name: "status",
        type: "string",
        required: false,
        description: "Filter by status (active, inactive, all)",
      },
      {
        name: "difficulty",
        type: "string",
        required: false,
        description: "Filter by difficulty (easy, medium, hard)",
      },
      {
        name: "max_cook_time",
        type: "number",
        required: false,
        description: "Maximum cooking time in minutes",
      },
      {
        name: "tags",
        type: "string[]",
        required: false,
        description: "Filter by tag IDs (can be repeated)",
      },
      {
        name: "search",
        type: "string",
        required: false,
        description: "Search in names and descriptions",
      },
      {
        name: "include_ingredients",
        type: "boolean",
        required: false,
        description: "Include full ingredient details",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Number of results (default: 50, max: 200)",
      },
      {
        name: "offset",
        type: "number",
        required: false,
        description: "Number of results to skip",
      },
    ],
    response: {
      dishes: [
        {
          id: "uuid",
          name_vi: "Phở Bò",
          name_en: "Beef Pho",
          description_vi: "Món phở truyền thống",
          description_en: "Traditional pho noodle soup",
          difficulty: "medium",
          cook_time: 180,
          prep_time: 30,
          servings: 4,
          image_url: null,
          source_url: null,
          status: "active",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          tags: [
            {
              id: "uuid",
              name_vi: "Món nước",
              name_en: "Soup",
              category: "meal_type",
            },
          ],
          ingredients: [
            // Only if include_ingredients=true
            {
              ingredient_id: "uuid",
              name_vi: "Thịt bò",
              name_en: "Beef",
              quantity: 0.5,
              unit: "kg",
              optional: false,
              notes: "Nạm hoặc gầu",
            },
          ],
          total_cost: 150000, // Only if include_ingredients=true
        },
      ],
      total: 100,
      limit: 50,
      offset: 0,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/dishes?difficulty=easy&include_ingredients=true" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/dishes",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    params={
        "difficulty": "easy",
        "include_ingredients": True
    }
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/dishes?difficulty=easy&include_ingredients=true', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "create-dish",
    method: "POST",
    path: "/api/v1/dishes",
    description: "Create a new dish with ingredients and tags",
    requestBody: {
      dish: {
        name_vi: "Phở Bò", // Required
        name_en: "Beef Pho", // Optional
        description_vi: "Món phở truyền thống", // Required
        description_en: "Traditional pho noodle soup", // Optional
        instructions_vi: "Ninh xương...", // Required
        instructions_en: "Simmer bones...", // Optional
        difficulty: "medium", // Required: easy, medium, hard (see /api/v1/dishes/categories)
        cook_time: 180, // Required, in minutes
        prep_time: 30, // Optional, defaults to 0
        servings: 4, // Optional, defaults to 4
        image_url: "https://...", // Optional, must be valid URL
        source_url: "https://...", // Optional, must be valid URL
        status: "active", // Optional: active, inactive (see /api/v1/dishes/categories)
      },
      ingredients: [
        {
          ingredient_id: "uuid", // Required
          quantity: 0.5, // Required, must be positive
          unit: "kg", // Required
          optional: false, // Optional, defaults to false
          notes: "Nạm hoặc gầu", // Optional
        },
      ],
      tags: ["uuid1", "uuid2"], // Optional array of tag IDs
    },
    response: {
      dish: {
        id: "uuid",
        name_vi: "Phở Bò",
        name_en: "Beef Pho",
        description_vi: "Món phở truyền thống",
        description_en: "Traditional pho noodle soup",
        instructions_vi: "Ninh xương...",
        instructions_en: "Simmer bones...",
        difficulty: "medium",
        cook_time: 180,
        prep_time: 30,
        servings: 4,
        image_url: null,
        source_url: null,
        status: "active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        ingredients: [
          {
            ingredient_id: "uuid",
            name_vi: "Thịt bò",
            name_en: "Beef",
            quantity: 0.5,
            unit: "kg",
            optional: false,
            notes: "Nạm hoặc gầu",
          },
        ],
        tags: [
          {
            id: "uuid",
            name_vi: "Món nước",
            name_en: "Soup",
            category: "meal_type",
          },
        ],
        total_cost: 150000,
      },
    },
    examples: {
      curl: `curl -X POST "${origin}/api/v1/dishes" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dish": {
      "name_vi": "Phở Bò",
      "name_en": "Beef Pho",
      "description_vi": "Món phở truyền thống",
      "instructions_vi": "Ninh xương...",
      "difficulty": "medium",
      "cook_time": 180
    },
    "ingredients": [
      {
        "ingredient_id": "uuid-here",
        "quantity": 0.5,
        "unit": "kg"
      }
    ],
    "tags": []
  }'`,
      python: `import requests

data = {
    "dish": {
        "name_vi": "Phở Bò",
        "name_en": "Beef Pho",
        "description_vi": "Món phở truyền thống",
        "instructions_vi": "Ninh xương...",
        "difficulty": "medium",
        "cook_time": 180
    },
    "ingredients": [
        {
            "ingredient_id": "uuid-here",
            "quantity": 0.5,
            "unit": "kg"
        }
    ],
    "tags": []
}

response = requests.post(
    "${origin}/api/v1/dishes",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  dish: {
    name_vi: "Phở Bò",
    name_en: "Beef Pho",
    description_vi: "Món phở truyền thống",
    instructions_vi: "Ninh xương...",
    difficulty: "medium",
    cook_time: 180
  },
  ingredients: [
    {
      ingredient_id: "uuid-here",
      quantity: 0.5,
      unit: "kg"
    }
  ],
  tags: []
};

const response = await fetch('${origin}/api/v1/dishes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
  {
    id: "batch-create-dishes",
    method: "POST",
    path: "/api/v1/dishes/batch",
    description: "Batch create up to 20 dishes",
    requestBody: {
      dishes: [
        {
          name_vi: "Phở Bò", // Required
          name_en: "Beef Pho", // Optional
          description_vi: "Món phở truyền thống", // Required
          description_en: "Traditional pho noodle soup", // Optional
          instructions_vi: "Ninh xương...", // Required
          instructions_en: "Simmer bones...", // Optional
          difficulty: "medium", // Required
          cook_time: 180, // Required
          prep_time: 30, // Optional
          servings: 4, // Optional
          status: "active", // Optional
          ingredients: [
            // Required array
            {
              ingredient_id: "uuid",
              quantity: 0.5,
              unit: "kg",
              optional: false,
              notes: "Nạm hoặc gầu",
            },
          ],
          tags: ["uuid1", "uuid2"], // Optional
        },
      ], // Array of 1-20 dishes
    },
    response: {
      summary: {
        total: 2,
        created: 2,
        failed: 0,
      },
      results: [
        {
          success: true,
          dish: {
            id: "uuid",
            name_vi: "Phở Bò",
            name_en: "Beef Pho",
            total_cost: 150000,
          },
        },
        {
          success: false,
          dish_name: "Bánh mì",
          error: "Some ingredients were not found",
        },
      ],
    },
    examples: {
      curl: `curl -X POST "${origin}/api/v1/dishes/batch" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dishes": [
      {
        "name_vi": "Phở Bò",
        "description_vi": "Món phở truyền thống",
        "instructions_vi": "Ninh xương...",
        "difficulty": "medium",
        "cook_time": 180,
        "ingredients": [
          {
            "ingredient_id": "uuid-here",
            "quantity": 0.5,
            "unit": "kg"
          }
        ]
      }
    ]
  }'`,
      python: `import requests

data = {
    "dishes": [
        {
            "name_vi": "Phở Bò",
            "description_vi": "Món phở truyền thống",
            "instructions_vi": "Ninh xương...",
            "difficulty": "medium",
            "cook_time": 180,
            "ingredients": [
                {
                    "ingredient_id": "uuid-here",
                    "quantity": 0.5,
                    "unit": "kg"
                }
            ]
        }
    ]
}

response = requests.post(
    "${origin}/api/v1/dishes/batch",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  dishes: [
    {
      name_vi: "Phở Bò",
      description_vi: "Món phở truyền thống",
      instructions_vi: "Ninh xương...",
      difficulty: "medium",
      cook_time: 180,
      ingredients: [
        {
          ingredient_id: "uuid-here",
          quantity: 0.5,
          unit: "kg"
        }
      ]
    }
  ]
};

const response = await fetch('${origin}/api/v1/dishes/batch', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
  {
    id: "get-tags",
    method: "GET",
    path: "/api/v1/tags",
    description: "List all tags with usage count",
    parameters: [
      {
        name: "category",
        type: "string",
        required: false,
        description: "Filter by tag category",
      },
    ],
    response: {
      tags: [
        {
          id: "uuid",
          name_vi: "Món nước",
          name_en: "Soup",
          category: "meal_type",
          usage_count: 25,
        },
      ],
      total: 50,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/tags?category=meal_type" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/tags",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    params={"category": "meal_type"}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/tags?category=meal_type', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "create-tag",
    method: "POST",
    path: "/api/v1/tags",
    description: "Create a new tag",
    requestBody: {
      tag: {
        name_vi: "Món chay", // Required
        name_en: "Vegetarian", // Optional
        category: "dietary", // Optional (see /api/v1/tags/categories)
      },
    },
    response: {
      duplicate_found: false,
      tag: {
        id: "uuid",
        name_vi: "Món chay",
        name_en: "Vegetarian",
        category: "dietary",
      },
    },
    examples: {
      curl: `curl -X POST "${origin}/api/v1/tags" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tag": {
      "name_vi": "Món chay",
      "name_en": "Vegetarian",
      "category": "dietary"
    }
  }'`,
      python: `import requests

data = {
    "tag": {
        "name_vi": "Món chay",
        "name_en": "Vegetarian",
        "category": "dietary"
    }
}

response = requests.post(
    "${origin}/api/v1/tags",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  tag: {
    name_vi: "Món chay",
    name_en: "Vegetarian",
    category: "dietary"
  }
};

const response = await fetch('${origin}/api/v1/tags', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
  {
    id: "get-menus",
    method: "GET",
    path: "/api/v1/menus",
    description: "List menus with cost calculation",
    parameters: [
      {
        name: "visibility",
        type: "string",
        required: false,
        description: "Filter by visibility (private, public)",
      },
      {
        name: "start_date",
        type: "string",
        required: false,
        description: "Filter menus starting after this date (ISO 8601)",
      },
      {
        name: "end_date",
        type: "string",
        required: false,
        description: "Filter menus ending before this date (ISO 8601)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Number of results (default: 50, max: 200)",
      },
      {
        name: "offset",
        type: "number",
        required: false,
        description: "Number of results to skip",
      },
    ],
    response: {
      menus: [
        {
          id: "uuid",
          name: "Thực đơn tuần này",
          description: "Thực đơn cho cả tuần",
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-01-07T00:00:00Z",
          servings: 4,
          visibility: "private",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          user: {
            id: "uuid",
            name: "John Doe",
            email: "john@example.com",
          },
          dishes_count: 21,
          total_cost: 1500000,
        },
      ],
      total: 10,
      limit: 50,
      offset: 0,
    },
    examples: {
      curl: `curl -X GET "${origin}/api/v1/menus?visibility=private" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "${origin}/api/v1/menus",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    params={"visibility": "private"}
)
data = response.json()`,
      javascript: `const response = await fetch('${origin}/api/v1/menus?visibility=private', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`,
    },
  },
  {
    id: "create-menu",
    method: "POST",
    path: "/api/v1/menus",
    description: "Create a new menu with dishes",
    requestBody: {
      menu: {
        name: "Thực đơn tuần này", // Required
        description: "Thực đơn cho cả tuần", // Optional
        start_date: "2024-01-01T00:00:00Z", // Optional
        end_date: "2024-01-07T00:00:00Z", // Optional
        servings: 4, // Optional, defaults to 4
        visibility: "private", // Optional, defaults to "private"
      },
      dishes: [
        // Optional array
        {
          dish_id: "uuid", // Required
          meal_group: "lunch", // Optional (see /api/v1/dishes/categories)
          day_index: 0, // Optional (0-6, Monday-Sunday)
          quantity: 1, // Optional, defaults to 1
          order_index: 0, // Optional, defaults to 0
        },
      ],
    },
    response: {
      menu: {
        id: "uuid",
        name: "Thực đơn tuần này",
        description: "Thực đơn cho cả tuần",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-07T00:00:00Z",
        servings: 4,
        visibility: "private",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        user: {
          id: "uuid",
          name: "John Doe",
          email: "john@example.com",
        },
        dishes: [
          {
            dish_id: "uuid",
            name_vi: "Phở Bò",
            name_en: "Beef Pho",
            meal_group: "lunch",
            day_index: 0,
            quantity: 1,
            order_index: 0,
          },
        ],
      },
    },
    examples: {
      curl: `curl -X POST "${origin}/api/v1/menus" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "menu": {
      "name": "Thực đơn tuần này",
      "description": "Thực đơn cho cả tuần",
      "servings": 4
    },
    "dishes": [
      {
        "dish_id": "uuid-here",
        "meal_group": "lunch",
        "day_index": 0
      }
    ]
  }'`,
      python: `import requests

data = {
    "menu": {
        "name": "Thực đơn tuần này",
        "description": "Thực đơn cho cả tuần",
        "servings": 4
    },
    "dishes": [
        {
            "dish_id": "uuid-here",
            "meal_group": "lunch",
            "day_index": 0
        }
    ]
}

response = requests.post(
    "${origin}/api/v1/menus",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json=data
)
result = response.json()`,
      javascript: `const data = {
  menu: {
    name: "Thực đơn tuần này",
    description: "Thực đơn cho cả tuần",
    servings: 4
  },
  dishes: [
    {
      dish_id: "uuid-here",
      meal_group: "lunch",
      day_index: 0
    }
  ]
};

const response = await fetch('${origin}/api/v1/menus', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const result = await response.json();`,
    },
  },
];
