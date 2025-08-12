# Exploro API Documentation

## Overview

The Exploro API provides programmatic access to manage culinary data including ingredients, dishes, menus, and tags. This RESTful API uses standard HTTP methods and returns JSON responses.

## Authentication

All API requests must include an API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## Base URL

```
http://localhost:3000/api/v1
```

For local development:

```
http://localhost:3000/api/v1
```

## Rate Limits

- **Default endpoints**: 1000 requests/hour
- **Batch endpoints**: 100 requests/hour

Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Your rate limit for the current window
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

## Error Handling

The API uses standard HTTP response codes. Error responses include:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Detailed error message",
    "details": {},
    "request_id": "req_123abc"
  }
}
```

Common error codes:

- `INVALID_API_KEY`: Invalid or missing API key
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `VALIDATION_ERROR`: Invalid request data
- `INGREDIENT_NOT_FOUND`: Requested ingredient not found
- `DUPLICATE_INGREDIENT`: Ingredient already exists

## Endpoints

### Ingredients

#### Get Ingredient Categories

```
GET /api/v1/ingredients/categories
```

Retrieve all available ingredient categories for classification.

**Response:**

```json
{
  "categories": [
    {
      "id": "uuid",
      "value": "vegetables",
      "name_vi": "Rau củ",
      "name_en": "Vegetables",
      "description": "Fresh vegetables and root vegetables",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 25
    },
    {
      "id": "uuid",
      "value": "meat",
      "name_vi": "Thịt",
      "name_en": "Meat",
      "description": "All types of meat including beef, pork, chicken",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 15
    },
    {
      "id": "uuid",
      "value": "seafood",
      "name_vi": "Hải sản",
      "name_en": "Seafood",
      "description": "Fish, shellfish, and other seafood",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 12
    },
    {
      "id": "uuid",
      "value": "spices",
      "name_vi": "Gia vị",
      "name_en": "Spices",
      "description": "Herbs, spices, and seasonings",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 18
    },
    {
      "id": "uuid",
      "value": "dairy",
      "name_vi": "Sữa và sản phẩm từ sữa",
      "name_en": "Dairy",
      "description": "Milk and dairy products",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 8
    },
    {
      "id": "uuid",
      "value": "grains",
      "name_vi": "Ngũ cốc",
      "name_en": "Grains",
      "description": "Rice, wheat, and other grains",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 10
    },
    {
      "id": "uuid",
      "value": "fruits",
      "name_vi": "Trái cây",
      "name_en": "Fruits",
      "description": "Fresh and dried fruits",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 6
    },
    {
      "id": "uuid",
      "value": "sauces",
      "name_vi": "Nước mắm, nước chấm",
      "name_en": "Sauces",
      "description": "Fish sauce, dipping sauces, and condiments",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 12
    },
    {
      "id": "uuid",
      "value": "other",
      "name_vi": "Khác",
      "name_en": "Other",
      "description": "Other ingredients not in above categories",
      "created_at": "2024-01-01T00:00:00Z",
      "ingredients_count": 5
    }
  ],
  "total": 9
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/ingredients/categories" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Get Ingredient Units

```
GET /api/v1/ingredients/units
```

Retrieve all available units for ingredient measurements with conversion factors.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by unit category (mass, volume, count, bundle, cooking) |
| grouped | boolean | No | Return units grouped by category |

**Response:**

```json
{
  "units": [
    {
      "value": "kg",
      "name_vi": "Kilogram",
      "name_en": "Kilogram",
      "symbol": "kg",
      "category": "mass",
      "base_unit": true,
      "factor_to_base": 1
    },
    {
      "value": "g",
      "name_vi": "Gram",
      "name_en": "Gram",
      "symbol": "g",
      "category": "mass",
      "base_unit": false,
      "factor_to_base": 0.001
    },
    {
      "value": "l",
      "name_vi": "Lít",
      "name_en": "Liter",
      "symbol": "l",
      "category": "volume",
      "base_unit": true,
      "factor_to_base": 1
    },
    {
      "value": "ml",
      "name_vi": "Mililít",
      "name_en": "Milliliter",
      "symbol": "ml",
      "category": "volume",
      "base_unit": false,
      "factor_to_base": 0.001
    },
    {
      "value": "cái",
      "name_vi": "Cái",
      "name_en": "Piece",
      "symbol": "cái",
      "category": "count",
      "base_unit": true,
      "factor_to_base": 1
    },
    {
      "value": "bó",
      "name_vi": "Bó",
      "name_en": "Bunch",
      "symbol": "bó",
      "category": "bundle",
      "base_unit": true,
      "factor_to_base": 1
    },
    {
      "value": "muỗng canh",
      "name_vi": "Muỗng canh",
      "name_en": "Tablespoon",
      "symbol": "muỗng canh",
      "category": "cooking",
      "base_unit": false,
      "factor_to_base": 0.015
    }
  ],
  "total": 20
}
```

**Example - Get grouped units:**

```bash
curl -X GET "http://localhost:3000/api/v1/ingredients/units?grouped=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response (grouped):**

```json
{
  "units": {
    "mass": [
      {
        "value": "kg",
        "name_vi": "Kilogram",
        "name_en": "Kilogram",
        "symbol": "kg",
        "category": "mass",
        "base_unit": true,
        "factor_to_base": 1
      },
      {
        "value": "g",
        "name_vi": "Gram",
        "name_en": "Gram",
        "symbol": "g",
        "category": "mass",
        "base_unit": false,
        "factor_to_base": 0.001
      }
    ],
    "volume": [
      {
        "value": "l",
        "name_vi": "Lít",
        "name_en": "Liter",
        "symbol": "l",
        "category": "volume",
        "base_unit": true,
        "factor_to_base": 1
      },
      {
        "value": "ml",
        "name_vi": "Mililít",
        "name_en": "Milliliter",
        "symbol": "ml",
        "category": "volume",
        "base_unit": false,
        "factor_to_base": 0.001
      }
    ],
    "count": [
      {
        "value": "cái",
        "name_vi": "Cái",
        "name_en": "Piece",
        "symbol": "cái",
        "category": "count",
        "base_unit": true,
        "factor_to_base": 1
      }
    ],
    "bundle": [
      {
        "value": "bó",
        "name_vi": "Bó",
        "name_en": "Bunch",
        "symbol": "bó",
        "category": "bundle",
        "base_unit": true,
        "factor_to_base": 1
      }
    ],
    "cooking": [
      {
        "value": "muỗng canh",
        "name_vi": "Muỗng canh",
        "name_en": "Tablespoon",
        "symbol": "muỗng canh",
        "category": "cooking",
        "base_unit": false,
        "factor_to_base": 0.015
      }
    ]
  },
  "total": 20,
  "categories": ["mass", "volume", "count", "bundle", "cooking"]
}
```

#### List Ingredients

```
GET /api/v1/ingredients
```

Retrieve a paginated list of ingredients with optional filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search in Vietnamese and English names |
| category | string | No | Filter by ingredient category |
| seasonal | boolean | No | Filter seasonal ingredients |
| limit | number | No | Number of results (default: 50, max: 200) |
| offset | number | No | Number of results to skip |

**Response:**

```json
{
  "ingredients": [
    {
      "id": "uuid",
      "name_vi": "Cà chua",
      "name_en": "Tomato",
      "category": "vegetables", // legacy field
      "category_id": "uuid", // new foreign key
      "default_unit": "kg", // legacy field
      "unit_id": "uuid", // new foreign key
      "current_price": 25000,
      "density": 1.0, // g/ml for mass-volume conversion
      "seasonal_flag": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/ingredients?search=tomato&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Create Ingredient

```
POST /api/v1/ingredients
```

Create a new ingredient with automatic duplicate detection.

**Request Body:**

```json
{
  "ingredient": {
    "name_vi": "Cà chua", // Required
    "name_en": "Tomato", // Optional
    "category": "vegetables", // Optional (legacy - use category_id instead)
    "category_id": "uuid", // Recommended - foreign key to category
    "default_unit": "kg", // Optional (legacy - use unit_id instead)
    "unit_id": "uuid", // Required - foreign key to unit
    "current_price": 25000, // Required, must be positive
    "density": 1.0, // Optional - g/ml for mass-volume conversion
    "seasonal_flag": false // Optional, defaults to false
  }
}
```

**Response:**

```json
{
  "duplicate_found": false,
  "ingredient": {
    "id": "uuid",
    "name_vi": "Cà chua",
    "name_en": "Tomato",
    "category": "vegetable",
    "default_unit": "kg",
    "current_price": 25000,
    "seasonal_flag": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

If a duplicate is found, the API returns status 200 with the existing ingredient and `duplicate_found: true`.

#### Get Single Ingredient

```
GET /api/v1/ingredients/{id}
```

Retrieve a single ingredient with price history.

**Response:**

```json
{
  "ingredient": {
    "id": "uuid",
    "name_vi": "Cà chua",
    "name_en": "Tomato",
    "category": "vegetable",
    "default_unit": "kg",
    "current_price": 25000,
    "seasonal_flag": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "price_history": [
      {
        "price": 25000,
        "recorded_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Update Ingredient

```
PUT /api/v1/ingredients/{id}
```

Update ingredient details. Price changes are automatically tracked in history.

**Request Body:**

```json
{
  "ingredient": {
    "name_vi": "Cà chua bi", // Optional
    "name_en": "Cherry Tomato", // Optional
    "category": "vegetable", // Optional
    "default_unit": "kg", // Optional
    "current_price": 30000, // Optional
    "seasonal_flag": true // Optional
  }
}
```

#### Delete Ingredient

```
DELETE /api/v1/ingredients/{id}
```

Delete an ingredient. Requires admin permission. Cannot delete ingredients that are used in dishes.

**Response:**

```json
{
  "message": "Ingredient deleted successfully"
}
```

#### Batch Create Ingredients

```
POST /api/v1/ingredients/batch
```

Create up to 50 ingredients in a single request.

**Request Body:**

```json
{
  "ingredients": [
    {
      "name_vi": "Cà chua",
      "name_en": "Tomato",
      "category": "vegetables", // Optional (legacy - use category_id instead)
      "category_id": "uuid", // Recommended - foreign key to category
      "default_unit": "kg", // Optional (legacy - use unit_id instead)
      "unit_id": "uuid", // Required - foreign key to unit
      "current_price": 25000,
      "density": 1.0, // Optional - g/ml for mass-volume conversion
      "seasonal_flag": false
    }
  ]
}
```

**Response (207 Multi-Status):**

```json
{
  "summary": {
    "total": 2,
    "created": 1,
    "existing": 1,
    "failed": 0
  },
  "results": [
    {
      "success": true,
      "created": true,
      "ingredient": {
        /* ingredient data */
      }
    },
    {
      "success": true,
      "created": false,
      "ingredient": {
        /* existing ingredient data */
      },
      "message": "Ingredient already exists"
    }
  ]
}
```

### Dishes

#### Get Dish Categories

```
GET /api/v1/dishes/categories
```

Retrieve all dish category options including difficulty levels, status options, and meal groups.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Get specific category type (difficulty, status, meal_groups) |

**Response:**

```json
{
  "categories": {
    "difficulty": [
      {
        "value": "easy",
        "name_vi": "Dễ",
        "name_en": "Easy",
        "description": "Simple dishes that can be prepared quickly with basic techniques"
      },
      {
        "value": "medium",
        "name_vi": "Trung bình",
        "name_en": "Medium",
        "description": "Dishes requiring moderate skill and preparation time"
      },
      {
        "value": "hard",
        "name_vi": "Khó",
        "name_en": "Hard",
        "description": "Complex dishes requiring advanced techniques and longer preparation"
      }
    ],
    "status": [
      {
        "value": "active",
        "name_vi": "Đang sử dụng",
        "name_en": "Active",
        "description": "Dish is currently available and in use"
      },
      {
        "value": "inactive",
        "name_vi": "Không sử dụng",
        "name_en": "Inactive",
        "description": "Dish is archived or not currently available"
      }
    ],
    "meal_groups": [
      {
        "value": "breakfast",
        "name_vi": "Bữa sáng",
        "name_en": "Breakfast",
        "description": "Morning meal dishes"
      },
      {
        "value": "lunch",
        "name_vi": "Bữa trưa",
        "name_en": "Lunch",
        "description": "Midday meal dishes"
      },
      {
        "value": "dinner",
        "name_vi": "Bữa tối",
        "name_en": "Dinner",
        "description": "Evening meal dishes"
      },
      {
        "value": "snack",
        "name_vi": "Ăn vặt",
        "name_en": "Snack",
        "description": "Light dishes or appetizers"
      }
    ]
  },
  "types": ["difficulty", "status", "meal_groups"]
}
```

**Example - Get only difficulty levels:**

```bash
curl -X GET "http://localhost:3000/api/v1/dishes/categories?type=difficulty" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### List Dishes

```
GET /api/v1/dishes
```

Retrieve a paginated list of dishes with optional filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (active, inactive, all) |
| difficulty | string | No | Filter by difficulty (easy, medium, hard) |
| max_cook_time | number | No | Maximum cooking time in minutes |
| tags | string[] | No | Filter by tag IDs (can be repeated) |
| search | string | No | Search in names and descriptions |
| include_ingredients | boolean | No | Include full ingredient details |
| limit | number | No | Number of results (default: 50, max: 200) |
| offset | number | No | Number of results to skip |

**Response:**

```json
{
  "dishes": [
    {
      "id": "uuid",
      "name_vi": "Phở Bò",
      "name_en": "Beef Pho",
      "description_vi": "Món phở truyền thống",
      "description_en": "Traditional pho noodle soup",
      "difficulty": "medium",
      "cook_time": 180,
      "prep_time": 30,
      "servings": 4,
      "image_url": null,
      "source_url": null,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "tags": [
        {
          "id": "uuid",
          "name_vi": "Món nước",
          "name_en": "Soup",
          "category": "meal_type"
        }
      ],
      "ingredients": [
        // Only if include_ingredients=true
        {
          "ingredient_id": "uuid",
          "name_vi": "Thịt bò",
          "name_en": "Beef",
          "quantity": 0.5,
          "unit": "kg",
          "optional": false,
          "notes": "Nạm hoặc gầu"
        }
      ],
      "total_cost": 150000 // Only if include_ingredients=true
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Create Dish

```
POST /api/v1/dishes
```

Create a new dish with ingredient associations and tags.

**Request Body:**

```json
{
  "dish": {
    "name_vi": "Phở Bò", // Required
    "name_en": "Beef Pho", // Optional
    "description_vi": "Món phở truyền thống", // Required
    "description_en": "Traditional pho", // Optional
    "instructions_vi": "Ninh xương...", // Required
    "instructions_en": "Simmer bones...", // Optional
    "difficulty": "medium", // Required: easy, medium, hard
    "cook_time": 180, // Required, in minutes
    "prep_time": 30, // Optional, defaults to 0
    "servings": 4, // Optional, defaults to 4
    "image_url": "https://...", // Optional, must be valid URL
    "source_url": "https://...", // Optional, must be valid URL
    "status": "active" // Optional, defaults to "active"
  },
  "ingredients": [
    {
      "ingredient_id": "uuid", // Required
      "quantity": 0.5, // Required, must be positive
      "unit": "kg", // Required
      "optional": false, // Optional, defaults to false
      "notes": "Nạm hoặc gầu" // Optional
    }
  ],
  "tags": ["uuid1", "uuid2"] // Optional array of tag IDs
}
```

**Response:**

```json
{
  "dish": {
    /* Full dish data including ingredients, tags, and total_cost */
  }
}
```

#### Batch Create Dishes

```
POST /api/v1/dishes/batch
```

Create up to 20 dishes in a single request.

**Request Body:**

```json
{
  "dishes": [
    {
      /* Same structure as single dish creation */
    }
  ]
}
```

**Response (207 Multi-Status):**

```json
{
  "summary": {
    "total": 2,
    "created": 2,
    "failed": 0
  },
  "results": [
    {
      "success": true,
      "dish": {
        "id": "uuid",
        "name_vi": "Phở Bò",
        "name_en": "Beef Pho",
        "total_cost": 150000
      }
    }
  ]
}
```

### Tags

#### Get Tag Categories

```
GET /api/v1/tags/categories
```

Retrieve all available tag categories for dish classification.

**Response:**

```json
{
  "categories": [
    {
      "value": "cooking_method",
      "name_vi": "Phương pháp nấu",
      "name_en": "Cooking Method",
      "description": "How the dish is prepared or cooked",
      "examples": [
        "Món chiên (Fried)",
        "Món xào (Stir-fried)",
        "Món nướng (Grilled)",
        "Món hấp (Steamed)",
        "Món luộc (Boiled)"
      ]
    },
    {
      "value": "meal_type",
      "name_vi": "Loại bữa ăn",
      "name_en": "Meal Type",
      "description": "Type of meal or course",
      "examples": [
        "Món chính (Main dish)",
        "Món phụ (Side dish)",
        "Món khai vị (Appetizer)",
        "Món tráng miệng (Dessert)",
        "Món canh (Soup)"
      ]
    },
    {
      "value": "cuisine",
      "name_vi": "Ẩm thực vùng miền",
      "name_en": "Cuisine",
      "description": "Regional or cultural cuisine style",
      "examples": [
        "Miền Bắc (Northern)",
        "Miền Trung (Central)",
        "Miền Nam (Southern)",
        "Ẩm thực Huế (Hue cuisine)",
        "Món Hà Nội (Hanoi dishes)"
      ]
    },
    {
      "value": "dietary",
      "name_vi": "Chế độ ăn",
      "name_en": "Dietary",
      "description": "Dietary restrictions or preferences",
      "examples": [
        "Món chay (Vegetarian)",
        "Thuần chay (Vegan)",
        "Không gluten (Gluten-free)",
        "Ít béo (Low-fat)",
        "Ít đường (Low-sugar)"
      ]
    },
    {
      "value": "occasion",
      "name_vi": "Dịp lễ",
      "name_en": "Occasion",
      "description": "Special occasions or holidays",
      "examples": [
        "Tết (Lunar New Year)",
        "Giỗ tổ (Ancestor worship)",
        "Cưới hỏi (Wedding)",
        "Sinh nhật (Birthday)",
        "Lễ hội (Festival)"
      ]
    },
    {
      "value": "flavor",
      "name_vi": "Hương vị",
      "name_en": "Flavor",
      "description": "Dominant flavor profile",
      "examples": [
        "Cay (Spicy)",
        "Ngọt (Sweet)",
        "Chua (Sour)",
        "Mặn (Salty)",
        "Đắng (Bitter)",
        "Umami"
      ]
    },
    {
      "value": "temperature",
      "name_vi": "Nhiệt độ",
      "name_en": "Temperature",
      "description": "Serving temperature",
      "examples": [
        "Món nóng (Hot dish)",
        "Món nguội (Cold dish)",
        "Món ấm (Warm dish)"
      ]
    },
    {
      "value": "texture",
      "name_vi": "Kết cấu",
      "name_en": "Texture",
      "description": "Primary texture of the dish",
      "examples": [
        "Giòn (Crispy)",
        "Mềm (Soft)",
        "Dai (Chewy)",
        "Béo ngậy (Rich/Creamy)"
      ]
    }
  ],
  "total": 8
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/tags/categories" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### List Tags

```
GET /api/v1/tags
```

Retrieve all available tags with usage count.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by tag category |

**Response:**

```json
{
  "tags": [
    {
      "id": "uuid",
      "name_vi": "Món nước",
      "name_en": "Soup",
      "category": "meal_type",
      "usage_count": 25
    }
  ],
  "total": 50
}
```

#### Create Tag

```
POST /api/v1/tags
```

Create a new tag.

**Request Body:**

```json
{
  "tag": {
    "name_vi": "Món chay", // Required
    "name_en": "Vegetarian", // Optional
    "category": "dietary" // Optional
  }
}
```

### Menus

#### List Menus

```
GET /api/v1/menus
```

Retrieve menus with cost calculation.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| visibility | string | No | Filter by visibility (private, public) |
| start_date | string | No | Filter menus starting after this date (ISO 8601) |
| end_date | string | No | Filter menus ending before this date (ISO 8601) |
| limit | number | No | Number of results (default: 50, max: 200) |
| offset | number | No | Number of results to skip |

**Response:**

```json
{
  "menus": [
    {
      "id": "uuid",
      "name": "Thực đơn tuần này",
      "description": "Thực đơn cho cả tuần",
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-01-07T00:00:00Z",
      "servings": 4,
      "visibility": "private",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "dishes_count": 21,
      "total_cost": 1500000
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

#### Create Menu

```
POST /api/v1/menus
```

Create a new menu with dish associations.

**Request Body:**

```json
{
  "menu": {
    "name": "Thực đơn tuần này", // Required
    "description": "Thực đơn cho cả tuần", // Optional
    "start_date": "2024-01-01T00:00:00Z", // Optional
    "end_date": "2024-01-07T00:00:00Z", // Optional
    "servings": 4, // Optional, defaults to 4
    "visibility": "private" // Optional, defaults to "private"
  },
  "dishes": [
    // Optional array
    {
      "dish_id": "uuid", // Required
      "meal_group": "lunch", // Optional
      "day_index": 0, // Optional (0-6, Monday-Sunday)
      "quantity": 1, // Optional, defaults to 1
      "order_index": 0 // Optional, defaults to 0
    }
  ]
}
```

## Data Models

### Ingredient Categories

- `vegetables` - Rau củ
- `meat` - Thịt
- `seafood` - Hải sản
- `spices` - Gia vị
- `dairy` - Sữa và sản phẩm từ sữa
- `grains` - Ngũ cốc
- `fruits` - Trái cây
- `sauces` - Nước mắm, nước chấm
- `other` - Khác

### Dish Difficulty Levels

- `easy` - Dễ
- `medium` - Trung bình
- `hard` - Khó

### Dish Status

- `active` - Đang sử dụng
- `inactive` - Không sử dụng

### Tag Categories

- `cooking_method` - Phương pháp nấu
- `meal_type` - Loại bữa ăn
- `cuisine` - Ẩm thực vùng miền
- `dietary` - Chế độ ăn
- `occasion` - Dịp lễ
- `flavor` - Hương vị

### Menu Visibility

- `private` - Riêng tư
- `public` - Công khai

### Meal Groups (for MenuDish)

- `breakfast` - Bữa sáng
- `lunch` - Bữa trưa
- `dinner` - Bữa tối
- `snack` - Ăn vặt

## Unit System

The API includes a comprehensive unit system for ingredient measurements.

### Unit Categories

#### Mass (Khối lượng)

- Base unit: `kg` (kilogram)
- Units: `kg`, `g`, `mg`, `tấn`
- Conversion: 1 kg = 1000 g

#### Volume (Thể tích)

- Base unit: `l` (liter)
- Units: `l`, `ml`, `cl`, `dl`
- Conversion: 1 l = 1000 ml

#### Count (Đếm)

- Base unit: `cái` (piece)
- Units: `cái`, `chiếc`, `con`, `quả`

#### Bundle (Bó/Chùm)

- Base unit: `bó` (bunch)
- Units: `bó`, `bụi`, `nải`, `chùm`

### Unit Conversions

Units within the same category can be converted using the `factor_to_base` field. Cross-category conversions (e.g., volume to mass) require ingredient-specific density values.

Example conversions:

- 1 kg = 1000 g (factor_to_base: 1.0 for kg, 0.001 for g)
- 1 l = 1000 ml (factor_to_base: 1.0 for l, 0.001 for ml)
- 1 bó rau ≈ 0.3 kg (ingredient-specific)

## Best Practices

1. **Pagination**: Always use pagination for list endpoints to improve performance
2. **Filtering**: Use query parameters to filter results instead of fetching all data
3. **Batch Operations**: Use batch endpoints when creating multiple items
4. **Error Handling**: Always check for error responses and handle them appropriately
5. **Rate Limiting**: Implement exponential backoff when rate limited
6. **Duplicate Detection**: The API automatically detects duplicates for ingredients and tags

## Code Examples

### Python

```python
import requests
import json

class ExploroAPI:
    def __init__(self, api_key, base_url="http://localhost:3000/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def list_ingredients(self, search=None, category=None, limit=50):
        params = {
            "limit": limit
        }
        if search:
            params["search"] = search
        if category:
            params["category"] = category

        response = requests.get(
            f"{self.base_url}/ingredients",
            headers=self.headers,
            params=params
        )
        return response.json()

    def create_ingredient(self, ingredient_data):
        response = requests.post(
            f"{self.base_url}/ingredients",
            headers=self.headers,
            json={"ingredient": ingredient_data}
        )
        return response.json()

# Usage
api = ExploroAPI("YOUR_API_KEY")
ingredients = api.list_ingredients(category="vegetable")
```

### JavaScript/TypeScript

```typescript
class ExploroAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "http://localhost:3000/api/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async listIngredients(params?: {
    search?: string;
    category?: string;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/ingredients?${queryString}`);
  }

  async createIngredient(ingredient: any) {
    return this.request("/ingredients", {
      method: "POST",
      body: JSON.stringify({ ingredient }),
    });
  }
}

// Usage
const api = new ExploroAPI("YOUR_API_KEY");
const ingredients = await api.listIngredients({ category: "vegetables" });
```

## Support

For API support, please contact api@exploro.app or visit our documentation at http://localhost:3000/docs/api.
