"""
Exploro API Integration Example - Python

This example demonstrates how to use the Exploro API to:
1. List existing ingredients (for deduplication)
2. Create new ingredients
3. Create dishes with ingredient associations
4. Handle errors and rate limiting
"""

import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

# Configuration
API_KEY = 'sk_live_your_api_key_here'
API_BASE_URL = 'https://exploro.app/api/v1'


class ExploroAPI:
    """Simple client for Exploro API"""
    
    def __init__(self, api_key: str, base_url: str = API_BASE_URL):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """Make API request and handle response"""
        url = f"{self.base_url}{endpoint}"
        
        response = self.session.request(
            method=method,
            url=url,
            json=data,
            params=params
        )
        
        # Extract rate limit info
        rate_limit = {
            'limit': response.headers.get('X-RateLimit-Limit'),
            'remaining': response.headers.get('X-RateLimit-Remaining'),
            'reset': response.headers.get('X-RateLimit-Reset'),
        }
        
        # Parse response
        result = response.json()
        
        # Handle errors
        if not response.ok:
            error_msg = result.get('error', {}).get('message', 'Unknown error')
            raise Exception(f"API Error ({response.status_code}): {error_msg}")
        
        return result, rate_limit
    
    def search_ingredients(self, search: str, category: Optional[str] = None) -> List[Dict]:
        """Search for existing ingredients"""
        params = {'search': search}
        if category:
            params['category'] = category
        
        result, rate_limit = self._make_request('GET', '/ingredients', params=params)
        
        print(f"Found {result['total']} ingredients matching '{search}'")
        print(f"Rate limit: {rate_limit['remaining']}/{rate_limit['limit']} remaining")
        
        return result['ingredients']
    
    def create_ingredient(self, ingredient: Dict) -> Dict:
        """Create a single ingredient"""
        result, _ = self._make_request('POST', '/ingredients', data={'ingredient': ingredient})
        
        if result['duplicate_found']:
            print(f"Ingredient '{ingredient['name_vi']}' already exists with ID: {result['ingredient']['id']}")
        else:
            print(f"Created ingredient '{ingredient['name_vi']}' with ID: {result['ingredient']['id']}")
        
        return result['ingredient']
    
    def batch_create_ingredients(self, ingredients: List[Dict]) -> List[Dict]:
        """Create multiple ingredients in one request"""
        result, _ = self._make_request('POST', '/ingredients/batch', data={'ingredients': ingredients})
        
        summary = result['summary']
        print(f"Batch results: {summary['created']} created, {summary['existing']} existing, {summary['failed']} failed")
        
        # Log any failures
        for item in result['results']:
            if not item['success']:
                print(f"  ❌ Failed to create {item.get('ingredient_name', 'unknown')}: {item.get('error')}")
        
        return result['results']
    
    def create_dish(self, dish_data: Dict) -> Dict:
        """Create a dish with ingredients"""
        result, _ = self._make_request('POST', '/dishes', data=dish_data)
        
        dish = result['dish']
        print(f"Created dish '{dish['name_vi']}' with ID: {dish['id']}")
        print(f"Total cost: {dish['total_cost']:,} VND")
        
        return dish
    
    def list_dishes(self, include_ingredients: bool = False, limit: int = 10) -> List[Dict]:
        """List dishes with optional ingredient details"""
        params = {
            'include_ingredients': str(include_ingredients).lower(),
            'limit': limit
        }
        
        result, _ = self._make_request('GET', '/dishes', params=params)
        return result['dishes']


def main():
    """Example workflow using the Exploro API"""
    print("=== Exploro API Integration Example (Python) ===\n")
    
    # Initialize API client
    api = ExploroAPI(API_KEY)
    
    try:
        # Step 1: Check for existing ingredients
        print("1. Checking for existing beef ingredient...")
        beef_ingredients = api.search_ingredients('Thịt bò')
        
        if beef_ingredients:
            beef_id = beef_ingredients[0]['id']
            print(f"   Found existing beef ingredient with ID: {beef_id}")
        else:
            # Create beef ingredient if it doesn't exist
            print("   No beef ingredient found, creating new one...")
            beef = api.create_ingredient({
                'name_vi': 'Thịt bò',
                'name_en': 'Beef',
                'category': 'meat',
                'default_unit': 'kg',
                'current_price': 280000,
            })
            beef_id = beef['id']
        
        # Step 2: Batch create multiple ingredients
        print("\n2. Batch creating vegetables...")
        vegetable_results = api.batch_create_ingredients([
            {
                'name_vi': 'Hành tím',
                'name_en': 'Shallot',
                'category': 'vegetables',
                'default_unit': 'kg',
                'current_price': 40000,
            },
            {
                'name_vi': 'Tỏi',
                'name_en': 'Garlic',
                'category': 'vegetables',
                'default_unit': 'kg',
                'current_price': 35000,
            },
            {
                'name_vi': 'Sả',
                'name_en': 'Lemongrass',
                'category': 'vegetables',
                'default_unit': 'kg',
                'current_price': 20000,
            },
            {
                'name_vi': 'Gừng',
                'name_en': 'Ginger',
                'category': 'vegetables',
                'default_unit': 'kg',
                'current_price': 30000,
            },
        ])
        
        # Extract ingredient IDs from successful results
        ingredient_ids = [r['ingredient']['id'] for r in vegetable_results if r['success']]
        
        # Step 3: Create a dish using the ingredients
        if beef_id and len(ingredient_ids) >= 3:
            print("\n3. Creating Phở Bò dish...")
            
            pho_bo = api.create_dish({
                'dish': {
                    'name_vi': 'Phở Bò Đặc Biệt',
                    'name_en': 'Special Beef Pho',
                    'description_vi': 'Phở bò đặc biệt với nhiều loại thịt và nước dùng đậm đà',
                    'description_en': 'Special beef pho with various meat cuts and rich broth',
                    'instructions_vi': '''1. Ninh xương bò trong 6-8 giờ
2. Nướng hành tím và gừng trên lửa
3. Cho vào nồi nước dùng cùng sả, hồi, quế
4. Lọc nước dùng và nêm gia vị
5. Trụng bánh phở và thịt bò
6. Cho bánh phở vào tô, xếp thịt lên trên
7. Chan nước dùng sôi và thưởng thức''',
                    'instructions_en': '''1. Simmer beef bones for 6-8 hours
2. Char shallots and ginger over flame
3. Add to broth with lemongrass, star anise, cinnamon
4. Strain broth and season
5. Blanch noodles and beef
6. Place noodles in bowl, arrange beef on top
7. Pour hot broth and enjoy''',
                    'difficulty': 'hard',
                    'cook_time': 480,  # 8 hours
                    'prep_time': 45,
                    'servings': 6,
                    'status': 'active',
                },
                'ingredients': [
                    {
                        'ingredient_id': beef_id,
                        'quantity': 1.0,
                        'unit': 'kg',
                        'optional': False,
                        'notes': 'Mix of brisket, flank, and tendon'
                    },
                    {
                        'ingredient_id': ingredient_ids[0],  # Shallot
                        'quantity': 0.3,
                        'unit': 'kg',
                        'optional': False,
                    },
                    {
                        'ingredient_id': ingredient_ids[1],  # Garlic
                        'quantity': 0.1,
                        'unit': 'kg',
                        'optional': False,
                    },
                    {
                        'ingredient_id': ingredient_ids[2],  # Lemongrass
                        'quantity': 0.05,
                        'unit': 'kg',
                        'optional': True,
                        'notes': 'For Southern style pho'
                    },
                ],
                'tags': [],  # Add tag IDs if available
            })
            
            if pho_bo:
                print("\n✅ Successfully created dish with ingredients!")
        
        # Step 4: List dishes with full details
        print("\n4. Fetching dishes with full ingredient details...")
        dishes = api.list_dishes(include_ingredients=True, limit=5)
        
        print(f"\nShowing {len(dishes)} dishes:")
        for dish in dishes:
            print(f"\n📍 {dish['name_vi']} ({dish.get('name_en', 'N/A')})")
            print(f"   Difficulty: {dish['difficulty']}, Cook time: {dish['cook_time']} mins")
            print(f"   Total cost: {dish.get('total_cost', 0):,} VND")
            
            if 'ingredients' in dish:
                print(f"   Ingredients ({len(dish['ingredients'])}):")
                for ing in dish['ingredients'][:3]:  # Show first 3
                    print(f"     - {ing['name_vi']}: {ing['quantity']} {ing['unit']}")
                if len(dish['ingredients']) > 3:
                    print(f"     ... and {len(dish['ingredients']) - 3} more")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())