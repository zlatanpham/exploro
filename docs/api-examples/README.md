# Exploro API Integration Examples

This directory contains example code demonstrating how to integrate with the Exploro API in various programming languages.

## Available Examples

- **Node.js** (`nodejs-example.js`) - JavaScript/TypeScript integration using fetch API
- **Python** (`python-example.py`) - Python integration using requests library

## Key Features Demonstrated

1. **Ingredient Deduplication**
   - Search existing ingredients before creating new ones
   - Handle duplicate detection responses

2. **Batch Operations**
   - Create multiple ingredients in a single request
   - Handle partial success/failure scenarios

3. **Dish Creation**
   - Create dishes with ingredient associations
   - Calculate total costs automatically

4. **Error Handling**
   - Parse API error responses
   - Handle rate limiting gracefully

5. **Best Practices**
   - Reusable API client class/functions
   - Proper authentication headers
   - Response parsing and logging

## Getting Started

1. Generate an API key from the Exploro admin panel
2. Replace `sk_live_your_api_key_here` with your actual API key
3. Update the base URL if using a different environment
4. Run the example:
   - Node.js: `node nodejs-example.js`
   - Python: `python python-example.py`

## API Rate Limits

- Standard endpoints: 1,000 requests/hour
- Batch endpoints: 100 requests/hour
- Search endpoints: 500 requests/hour

Rate limit information is included in response headers:

- `X-RateLimit-Limit` - Your rate limit
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Unix timestamp when limit resets

## Common Integration Patterns

### 1. Ingredient Import with Deduplication

```javascript
// Search first
const existing = await searchIngredients('Thịt bò');

if (existing.length > 0) {
  // Use existing ingredient
  ingredientId = existing[0].id;
} else {
  // Create new ingredient
  const result = await createIngredient({...});
  ingredientId = result.id;
}
```

### 2. Bulk Import from External Source

```python
# Prepare ingredients from your data source
ingredients = [
    {'name_vi': name, 'category': cat, ...}
    for name, cat in external_data
]

# Batch create with deduplication
results = api.batch_create_ingredients(ingredients)

# Extract successful IDs
ingredient_map = {
    r['ingredient']['name_vi']: r['ingredient']['id']
    for r in results if r['success']
}
```

### 3. Menu Synchronization

```javascript
// Get existing dishes
const dishes = await listDishes({ status: 'active' });

// Create new menu with selected dishes
const menu = await createMenu({
  menu: { name: 'Weekly Menu', ... },
  dishes: dishes.map(d => ({
    dish_id: d.id,
    meal_group: 'lunch',
    quantity: 1
  }))
});
```

## Error Codes

Common error codes you may encounter:

- `INVALID_API_KEY` - API key is invalid or expired
- `PERMISSION_DENIED` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `DUPLICATE_INGREDIENT` - Ingredient already exists
- `VALIDATION_ERROR` - Invalid request data
- `INGREDIENT_NOT_FOUND` - Referenced ingredient not found

## Support

For API support or questions:

- Check the full API documentation at `/admin/api-docs`
- Review the OpenAPI specification at `/api/v1/docs`
- Report issues in the GitHub repository
