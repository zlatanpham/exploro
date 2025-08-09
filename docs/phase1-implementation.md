# Vietnamese Meal Planning Application - Phase 1 Implementation

## Overview

This document describes the Phase 1 MVP implementation of the Vietnamese meal planning application based on the requirements document.

## Implemented Features

### 1. Database Schema
- Extended Prisma schema with models for:
  - **Dish**: Vietnamese dishes with bilingual support
  - **Ingredient**: Ingredient management with pricing
  - **Tag**: Categorization system for dishes
  - **Menu**: User meal plans
  - **MenuDish**: Dishes in menus
  - **DishIngredient**: Ingredients in dishes
  - **FavoriteDish**: User favorites
  - **PriceHistory**: Track ingredient price changes
  - **MenuShare**: Share links for menus

### 2. User Authentication & Roles
- Extended User model with:
  - `role` field (default: "user", admin via manual DB update)
  - `language_preference` field (vi/en)
- Updated NextAuth configuration to include role and language in session

### 3. API Routes (tRPC)
Created comprehensive API routers:
- **ingredient.ts**: CRUD operations, price management, bulk updates
- **tag.ts**: Tag management with categories
- **dish.ts**: Full dish management, search, favorites
- **menu.ts**: Menu CRUD, sharing, ingredient aggregation

### 4. Admin Features
Admin-only pages at `/admin/*`:
- **Ingredients Management** (`/admin/ingredients`)
  - Add/edit/delete ingredients
  - Set prices and categories
  - Track seasonal availability
  - Bulk price updates

- **Tags Management** (`/admin/tags`)
  - Create categorized tags
  - Bilingual tag names
  - Organized by category

- **Dishes Management** (`/admin/dishes`)
  - Full dish CRUD operations
  - Status management (active/inactive)
  - Search and filtering

### 5. Public Features

- **Dish Browsing** (`/dishes`)
  - Grid view with images
  - Search by name/description
  - Filter by difficulty, cook time, tags
  - Favorite dishes functionality
  - Detailed dish view with ingredients

- **Menu Management** (`/menus`)
  - Create personal menus
  - Set visibility (private/public)
  - Menu details with multiple views:
    - Weekly calendar view
    - List view
    - Shopping list with aggregated ingredients
  - Cost calculation (total and per person)

- **Favorites** (`/favorites`)
  - View and manage favorite dishes
  - Quick access to frequently used dishes

### 6. Vietnamese Language Support
- Comprehensive language context provider
- Toggle between Vietnamese (vi) and English (en)
- Translations for all UI elements
- Support for Vietnamese measurement units
- Vietnamese currency formatting (VND)

### 7. Core Components

- **Language Context** (`_context/language.tsx`)
  - Global language state management
  - Translation function `t()`
  - User preference persistence

- **Updated Sidebar Navigation**
  - Role-based menu items
  - Language toggle button
  - Admin section for admin users

- **Dashboard** (Updated home page)
  - Quick stats and actions
  - Recent menus
  - Admin quick access panel

## Technical Implementation

### File Structure
```
src/
├── app/(protected)/
│   ├── _context/
│   │   └── language.tsx          # Language context provider
│   ├── admin/
│   │   ├── dishes/              # Admin dish management
│   │   ├── ingredients/         # Admin ingredient management
│   │   └── tags/               # Admin tag management
│   ├── dishes/
│   │   ├── page.tsx            # Public dish browsing
│   │   └── [id]/page.tsx       # Dish detail view
│   ├── favorites/page.tsx      # User favorites
│   ├── menus/
│   │   ├── page.tsx            # Menu listing
│   │   └── [id]/page.tsx       # Menu detail view
│   └── page.tsx                # Updated dashboard
├── server/api/routers/
│   ├── dish.ts                 # Dish API endpoints
│   ├── ingredient.ts           # Ingredient API endpoints
│   ├── menu.ts                 # Menu API endpoints
│   └── tag.ts                  # Tag API endpoints
└── components/
    └── app-sidebar.tsx         # Updated with meal planning navigation
```

### Database Seed Data
Created seed script at `scripts/seed-data.ts` with:
- Admin user: `admin@exploro.com` (password: `admin123`)
- Sample ingredients with categories and prices
- Sample tags for categorization
- Sample dishes with ingredients

## Usage Instructions

### 1. Initial Setup
```bash
# Start database
./start-database.sh

# Install dependencies
pnpm install

# Push schema to database
pnpm run db:push

# Seed initial data
pnpm run db:seed

# Start development server
pnpm run dev
```

### 2. Access the Application
- Application URL: http://localhost:3001
- Admin login: admin@exploro.com / admin123

### 3. Admin Tasks
1. Log in with admin credentials
2. Navigate to admin sections via sidebar
3. Add ingredients with Vietnamese/English names and prices
4. Create tags for categorization
5. Add dishes with ingredients and instructions

### 4. User Features
1. Register a new account (will have "user" role by default)
2. Browse public dishes
3. Add dishes to favorites
4. Create personal menus
5. View aggregated shopping lists with costs

## Key Features Implemented

✅ **User Authentication**
- Email/password authentication
- Role-based access (user/admin)
- Language preference per user

✅ **Admin Management**
- Complete CRUD for dishes, ingredients, tags
- Bilingual content support
- Price tracking and history

✅ **Dish Features**
- Public browsing with search/filters
- Detailed nutritional and cost information
- Image support
- Difficulty levels and cooking times

✅ **Menu Planning**
- Create multi-day meal plans
- Organize by meals (breakfast, lunch, dinner)
- Automatic ingredient aggregation
- Total cost calculation

✅ **Vietnamese Support**
- Full UI translation
- Vietnamese measurement units
- VND currency formatting
- Bilingual content fields

## Next Steps (Phase 2 Recommendations)

1. **Menu Enhancements**
   - Menu templates
   - Meal planning calendar
   - Share links with QR codes
   - PDF export for shopping lists

2. **Social Features**
   - User dish submissions
   - Ratings and reviews
   - Public menu gallery
   - User profiles

3. **Advanced Features**
   - Nutritional information
   - Dietary restrictions/tags
   - Meal prep instructions
   - Grocery store integration

4. **Mobile Optimization**
   - Progressive Web App
   - Offline support
   - Mobile-specific UI adjustments

## Technical Notes

- The application uses tRPC for type-safe APIs
- Prisma ORM with PostgreSQL for data persistence
- NextAuth for authentication with role support
- Tailwind CSS and shadcn/ui for styling
- Full TypeScript implementation
- Vietnamese language support throughout