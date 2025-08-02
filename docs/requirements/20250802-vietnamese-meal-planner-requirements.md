# Vietnamese Family Meal Planning Application - Requirements Document

**Document Version**: 1.0  
**Date**: August 2, 2025  
**Project Name**: Vietnamese Family Meal Planner  
**Document Type**: Business Requirements Document (BRD)

---

## Executive Summary

The Vietnamese Family Meal Planning Application is a web-based platform designed to simplify meal planning for Vietnamese families. The application addresses the common challenges of meal planning, ingredient management, and cost estimation by providing a comprehensive solution that allows users to browse dishes, create custom menus, and calculate total ingredient costs.

The platform features a dual-role system where administrators manage dish and ingredient data, while regular users can search dishes, create personalized menus, and share meal plans with others. The application emphasizes Vietnamese cuisine and supports Vietnamese language for ingredients and pricing, making it culturally relevant and accessible to the target audience.

Key value propositions include:

- Centralized repository of Vietnamese dishes with detailed cooking information
- Automated ingredient aggregation and cost calculation
- Collaborative meal planning through menu sharing
- Time-saving through organized meal grouping and planning

---

## Business Context and Problem Statement

### Current Challenges

Vietnamese families face several challenges in meal planning:

1. **Repetitive Meal Selection**: Families often cook the same dishes due to lack of inspiration or knowledge of alternatives
2. **Budget Management**: Difficulty in estimating meal costs before shopping
3. **Ingredient Waste**: Poor planning leads to buying excess ingredients or missing key items
4. **Time Management**: Lack of organized meal schedules results in last-minute decisions
5. **Knowledge Sharing**: Limited platforms for sharing family recipes and meal plans within communities

### Business Opportunity

By digitalizing the meal planning process with a focus on Vietnamese cuisine, this application can:

- Save families 2-3 hours per week on meal planning
- Reduce food waste by 20-30% through better ingredient planning
- Decrease grocery expenses by 15-20% through cost visibility
- Preserve and share Vietnamese culinary traditions

---

## Stakeholder Analysis

### Primary Stakeholders

1. **End Users (Families)**
   - Vietnamese families planning weekly/monthly meals
   - Individuals responsible for household cooking
   - Users seeking to discover new Vietnamese dishes

2. **Content Administrators**
   - Platform administrators managing dish database
   - Recipe contributors and validators
   - Ingredient price managers

3. **System Administrators**
   - Technical team maintaining the platform
   - Database administrators
   - Security and performance monitors

### Secondary Stakeholders

1. **Recipe Content Providers**
   - Food bloggers and recipe websites (source attribution)
   - Traditional recipe holders

2. **Grocery Retailers**
   - Potential partners for ingredient pricing data
   - Future e-commerce integration possibilities

---

## Functional Requirements

### FR1: User Management and Authentication

**FR1.1** The system shall support two distinct user roles:

- Administrator (admin)
- Regular User (user)

All newly registered users shall be assigned the "user" role by default. The "admin" role shall be assigned manually through direct database modification.

**FR1.2** User registration shall require:

- Email address (unique)
- Password (minimum 8 characters)
- Display name
- Preferred language (Vietnamese/English)

**FR1.3** Authentication features shall include:

- Secure login/logout
- Password reset via email
- Session management
- Remember me functionality

**Acceptance Criteria:**

- Users can successfully register and login
- Password reset emails are delivered within 2 minutes
- Sessions expire after 7 days of inactivity

### FR2: Dish Management (Admin)

**FR2.1** Administrators shall be able to create, read, update, and delete dishes with the following properties:

- Name (required, bilingual support)
- Short description (required, max 200 characters)
- Ingredients (required, linked to ingredients table)
- Preview image (required, max 5MB, JPEG/PNG)
- Source URL (optional, for attribution)
- Difficulty level (required, enum: Easy/Medium/Hard)
- Time to cook (required, in minutes)
- Serving size (required, number of people)
- Instructions (required, step-by-step)
- Tags (optional, linked to tags table)

**FR2.2** Dish ingredient management shall:

- Link to master ingredients table
- Specify quantity and unit for each ingredient
- Support Vietnamese measurement units (e.g., "nắm", "thìa", "chén")
- Allow ingredient substitutions

**FR2.3** Bulk operations shall include:

- Import dishes from CSV/Excel
- Export dish database
- Batch tag assignment
- Bulk status updates (active/inactive)

**Acceptance Criteria:**

- Admin can create a dish with all required fields
- Validation prevents duplicate dish names
- Image upload handles errors gracefully
- Ingredient quantities are properly associated

### FR3: Ingredient Management (Admin)

**FR3.1** Administrators shall manage a master ingredients table with:

- Ingredient name (Vietnamese and English)
- Category (e.g., vegetables, meat, spices)
- Default unit of measurement
- Current average price
- Price last updated date
- Seasonal availability flag

**FR3.2** Price management features shall include:

- Manual price updates
- Price history tracking
- Bulk price import
- Regional price variations (optional for MVP)

**FR3.3** Ingredient categorization shall support:

- Primary categories (10-15 main categories)
- Searchable ingredient database
- Common name aliases

**Acceptance Criteria:**

- Prices display in Vietnamese Dong (VND) format
- Price updates are logged with timestamp
- Ingredient search returns results in <500ms

### FR4: Public Dish Browsing and Search

**FR4.1** Public dish listing shall display:

- Dish preview image
- Name and short description
- Difficulty level indicator
- Cooking time
- Serving size
- Tags

**FR4.2** Search functionality shall support:

- Text search across dish names and descriptions
- Filter by difficulty level
- Filter by cooking time ranges
- Filter by tags
- Filter by ingredients (include/exclude)
- Sort by: newest, cooking time, difficulty, popularity

**FR4.3** Dish detail view shall show:

- All dish properties
- Ingredient list with quantities
- Step-by-step instructions
- Estimated total cost
- Nutritional information (future enhancement)
- User ratings and comments (future enhancement)

**Acceptance Criteria:**

- Search results return within 1 second
- Filters can be combined
- Zero results show helpful suggestions
- Mobile-responsive dish cards

### FR5: Menu Creation and Management (User)

**FR5.1** Users shall be able to create custom menus containing:

- Menu name
- Description
- Multiple dishes
- Target date/date range
- Number of people
- Menu visibility (private/public)

**FR5.2** Menu builder features shall include:

- Drag-and-drop dish ordering
- Quick dish search and add
- Dish quantity adjustment
- Remove dishes
- Duplicate entire menus
- Menu templates

**FR5.3** Users shall be able to organize menus into:

- Meal groups (breakfast, lunch, dinner)
- Day-based planning (Monday-Sunday)
- Special occasion categories

**Acceptance Criteria:**

- Users can create menus with 1-50 dishes
- Menu changes save automatically
- Dish additions update ingredient list in real-time

### FR6: Ingredient Aggregation and Cost Estimation

**FR6.1** The system shall automatically aggregate ingredients across all dishes in a menu:

- Combine same ingredients from different dishes
- Convert units where possible
- Show aggregated shopping list
- Maintain dish source for each ingredient

**FR6.2** Cost estimation shall:

- Calculate total cost based on current prices
- Show cost per person
- Indicate if prices are outdated (>30 days)
- Display cost breakdown by category
- Support cost range for variable-price items

**FR6.3** Shopping list features shall include:

- Printable format
- Check-off functionality
- Group by store sections
- Email/share shopping list
- Save as PDF

**Acceptance Criteria:**

- Ingredient aggregation handles different units correctly
- Cost calculations update when prices change
- Shopping list exports maintain Vietnamese formatting

### FR7: Menu Sharing and Publishing

**FR7.1** Menu sharing shall support:

- Generate shareable link
- Set expiration date for shared links
- View-only or clone permissions
- Social media sharing buttons
- QR code generation

**FR7.2** Published menus shall:

- Be discoverable in public menu gallery
- Display creator attribution
- Show creation/modification dates
- Allow users to clone to their account
- Support likes and bookmarks

**FR7.3** Privacy controls shall include:

- Make menu private/public
- Restrict sharing to registered users only
- Remove menu from public listings
- Delete shared links

**Acceptance Criteria:**

- Shared links work without user login
- Published menus load within 2 seconds
- Privacy changes take effect immediately

### FR8: Vietnamese Language Support

**FR8.1** The application shall support:

- Bilingual interface (Vietnamese/English)
- Vietnamese input for all text fields
- Proper Vietnamese currency formatting (₫)
- Vietnamese date/time formats
- Traditional measurement units

**FR8.2** Language-specific features shall include:

- Ingredient names in both languages
- Automatic transliteration for search
- Vietnamese keyboard support
- Proper text sorting for Vietnamese

**Acceptance Criteria:**

- Users can switch languages without data loss
- Vietnamese characters display correctly
- Search works with both languages

---

## Non-Functional Requirements

### NFR1: Performance

- **NFR1.1** Page load time shall not exceed 3 seconds on 3G connections
- **NFR1.2** Search results shall return within 1 second
- **NFR1.3** System shall support 1,000 concurrent users
- **NFR1.4** Database queries shall complete within 500ms
- **NFR1.5** Image optimization shall reduce file sizes by 60% without visible quality loss

### NFR2: Security

- **NFR2.1** All passwords shall be hashed using bcrypt with salt
- **NFR2.2** HTTPS shall be enforced for all connections
- **NFR2.3** Session tokens shall be securely generated and stored
- **NFR2.4** Rate limiting shall prevent brute force attacks
- **NFR2.5** User data shall be encrypted at rest

### NFR3: Usability

- **NFR3.1** Mobile-first responsive design
- **NFR3.2** WCAG 2.1 AA accessibility compliance
- **NFR3.3** Maximum 3 clicks to reach any feature
- **NFR3.4** Consistent UI patterns throughout application
- **NFR3.5** Helpful error messages in user's language

### NFR4: Reliability

- **NFR4.1** 99.9% uptime availability
- **NFR4.2** Automated backups every 6 hours
- **NFR4.3** Disaster recovery within 4 hours
- **NFR4.4** Graceful handling of third-party service failures

### NFR5: Scalability

- **NFR5.1** Horizontal scaling capability
- **NFR5.2** CDN integration for static assets
- **NFR5.3** Database read replicas for performance
- **NFR5.4** Caching strategy for frequently accessed data

### NFR6: Maintainability

- **NFR6.1** Modular architecture with clear separation of concerns
- **NFR6.2** Comprehensive API documentation
- **NFR6.3** Automated testing coverage >80%
- **NFR6.4** Standardized coding conventions
- **NFR6.5** Database migration versioning

---

## User Stories

### Administrator Stories

1. **As an administrator, I want to add new Vietnamese dishes to the platform so that users have a diverse selection of meals to choose from.**
   - Acceptance: Successfully create a dish with all required fields
   - Priority: High

2. **As an administrator, I want to update ingredient prices in bulk so that cost estimates remain accurate.**
   - Acceptance: Import CSV with price updates affecting multiple ingredients
   - Priority: High

3. **As an administrator, I want to moderate user-submitted content so that the platform maintains quality standards.**
   - Acceptance: Review and approve/reject user submissions
   - Priority: Medium

### User Stories

4. **As a user, I want to search for dishes by ingredients I have at home so that I can minimize grocery shopping.**
   - Acceptance: Filter dishes by including specific ingredients
   - Priority: High

5. **As a user, I want to create a weekly meal plan so that I can organize my family's meals efficiently.**
   - Acceptance: Create menu with 7 days of meals organized by meal type
   - Priority: High

6. **As a user, I want to see the total cost of my menu so that I can stay within my budget.**
   - Acceptance: View aggregated cost with breakdown by category
   - Priority: High

7. **As a user, I want to share my meal plan with family members so that everyone knows what's for dinner.**
   - Acceptance: Generate shareable link that works without login
   - Priority: Medium

8. **As a user, I want to save favorite dishes so that I can quickly add them to future menus.**
   - Acceptance: Bookmark dishes and access from favorites list
   - Priority: Medium

---

## Data Model Overview

### Core Entities

1. **Users**
   - id, email, password_hash, name, role (default: 'user'), language_preference
   - Relationships: owns Menus, creates MenuShares

2. **Dishes**
   - id, name_vi, name_en, description, difficulty, cook_time, servings
   - instructions, image_url, source_url, status
   - Relationships: has DishIngredients, has DishTags

3. **Ingredients**
   - id, name_vi, name_en, category, default_unit, current_price
   - price_updated_at, seasonal_flag
   - Relationships: used in DishIngredients

4. **DishIngredients** (Junction Table)
   - dish_id, ingredient_id, quantity, unit, notes
   - Relationships: links Dishes and Ingredients

5. **Tags**
   - id, name_vi, name_en, category
   - Relationships: applied to Dishes via DishTags

6. **Menus**
   - id, user_id, name, description, date_range, visibility
   - Relationships: contains MenuDishes, has MenuShares

7. **MenuDishes** (Junction Table)
   - menu_id, dish_id, meal_group, day_index, quantity
   - Relationships: links Menus and Dishes

8. **MenuShares**
   - id, menu_id, share_url, permissions, expires_at
   - Relationships: belongs to Menu

### Data Integrity Rules

- Cascade delete for user data
- Soft delete for dishes (maintain historical menus)
- Price history retention for 12 months
- Ingredient names must be unique within language

---

## Success Criteria

### Quantitative Metrics

1. **User Adoption**
   - 1,000 registered users within 3 months
   - 500 active monthly users by month 6
   - Average 3 menus created per user per month

2. **Content Growth**
   - 500 dishes in database at launch
   - 1,000 dishes within 6 months
   - 95% of dishes with accurate pricing

3. **Performance Metrics**
   - Average page load time <2 seconds
   - Search response time <500ms
   - 99.5% uptime achieved

4. **User Engagement**
   - Average session duration >5 minutes
   - 60% monthly active user retention
   - 20% of users share menus monthly

### Qualitative Metrics

1. **User Satisfaction**
   - User satisfaction score >4.0/5.0
   - Positive feedback on ease of use
   - Successful Vietnamese language implementation

2. **Business Value**
   - Users report 20% reduction in meal planning time
   - Users report 15% reduction in food waste
   - Platform becomes reference for Vietnamese cooking

---

## MVP Scope Recommendations

### Phase 1: Core MVP (3 months)

**Included:**

- User authentication (basic email/password)
  - Default "user" role assignment for new registrations
  - Manual database updates for "admin" role assignment
- Admin dish management
- Ingredient and pricing management
- Public dish browsing and search
- Basic menu creation
- Ingredient aggregation and cost calculation
- Vietnamese language support

**Excluded:**

- Self-service admin role management
- Social features (comments, ratings)
- Advanced sharing (social media integration)
- Mobile applications
- Third-party integrations
- Regional pricing variations

### Phase 2: Enhanced Features (3 months)

- Menu sharing and publishing
- Menu templates and meal planning
- Favorites and bookmarks
- Basic analytics dashboard
- Email notifications
- PDF export for shopping lists

### Phase 3: Community Features (3 months)

- User dish submissions
- Ratings and reviews
- Social sharing integration
- Nutritional information
- Mobile applications
- Grocery store partnerships

### Technical Architecture Recommendations

Based on the existing Next.js starter:

1. **Database Schema Extensions**
   - Add Dishes, Ingredients, Tags tables
   - Implement junction tables for relationships
   - Add price history tracking

2. **API Development**
   - Create tRPC routers for dishes, ingredients, menus
   - Implement search with PostgreSQL full-text search
   - Add caching layer for frequently accessed data

3. **Frontend Features**
   - Implement dish cards with image optimization
   - Create drag-and-drop menu builder
   - Add Vietnamese language toggle
   - Build responsive search interface

4. **Security Enhancements**
   - Add role-based access control
   - Implement rate limiting
   - Add input sanitization for Vietnamese text

---

## Assumptions and Constraints

### Assumptions

1. Users have basic internet connectivity
2. Initial content will be curated by administrators
3. Ingredient prices will be updated weekly
4. Users understand basic meal planning concepts
5. Vietnamese cuisine focus (can expand later)

### Constraints

1. Limited initial budget for infrastructure
2. Small development team (2-3 developers)
3. Must use existing Next.js starter architecture
4. PostgreSQL as primary database
5. Initial deployment to single region

### Risks and Mitigation

1. **Risk**: Inaccurate pricing data
   - _Mitigation_: Partner with local markets, crowdsource updates

2. **Risk**: Low user adoption
   - _Mitigation_: SEO optimization, content marketing, community engagement

3. **Risk**: Performance issues with growth
   - _Mitigation_: Implement caching early, plan for horizontal scaling

4. **Risk**: Content quality concerns
   - _Mitigation_: Admin moderation, community reporting features

---

## Next Steps

1. **Technical Planning**
   - Finalize database schema design
   - Create API specifications
   - Design UI mockups
   - Set up development environment

2. **Content Strategy**
   - Source initial dish database
   - Establish ingredient categorization
   - Create content guidelines
   - Plan pricing data collection

3. **Development Timeline**
   - Week 1-2: Database schema and migrations
   - Week 3-4: Admin interfaces
   - Week 5-8: User features and search
   - Week 9-10: Menu builder
   - Week 11-12: Testing and deployment

---

## Appendices

### A. Glossary of Vietnamese Cooking Terms

- **Nắm**: Handful (measurement)
- **Thìa**: Spoon (measurement)
- **Chén**: Bowl (measurement)
- **Muỗng canh**: Tablespoon
- **Muỗng cà phê**: Teaspoon

### B. Technology Stack Details

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: tRPC, Prisma ORM, PostgreSQL
- Authentication: NextAuth.js
- Image Storage: Cloudinary or S3
- Deployment: Vercel or AWS

### C. Compliance Considerations

- GDPR compliance for user data
- Vietnamese data protection regulations
- Food imagery copyright considerations
- Recipe attribution requirements

---

**Document Approval**

| Role             | Name        | Date           | Signature  |
| ---------------- | ----------- | -------------- | ---------- |
| Business Analyst | [Your Name] | August 2, 2025 | ****\_**** |
| Project Manager  | ****\_****  | ****\_****     | ****\_**** |
| Technical Lead   | ****\_****  | ****\_****     | ****\_**** |
| Product Owner    | ****\_****  | ****\_****     | ****\_**** |

---

_This document serves as the foundation for developing the Vietnamese Family Meal Planning Application. Regular reviews and updates should be conducted as the project progresses and new requirements emerge._
