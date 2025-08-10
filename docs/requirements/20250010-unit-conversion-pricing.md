# Unit Conversion for Ingredient Pricing System - Requirements Document

**Document Version**: 1.0  
**Date**: August 10, 2025  
**Status**: Draft  
**Author**: Business Analyst

## Executive Summary

This document outlines the requirements for implementing a comprehensive unit conversion system within the ingredient pricing module of the meal planning application. The system will enable accurate cost calculations when dishes use ingredients in different units than their base pricing unit, ensuring precise financial tracking and cost analysis for menu planning.

## 1. Business Context and Problem Statement

### 1.1 Current State

- Ingredients have a `default_unit` field and `current_price` stored in the database
- Dishes can specify ingredients with any unit via the `DishIngredient.unit` field
- Cost calculations currently multiply quantity by price without unit consideration
- This leads to incorrect pricing when units don't match (e.g., recipe uses 200g of an ingredient priced per kg)

### 1.2 Business Problem

The current system produces inaccurate cost calculations when:

- A dish requires 200 grams of chicken, but chicken is priced at 120,000 VND per kilogram
- A recipe needs 2 tablespoons of oil, but oil is priced per liter
- An ingredient is purchased in bulk (kg) but used in smaller quantities (g)

This results in:

- Incorrect dish cost calculations
- Inaccurate menu budgeting
- Poor pricing decisions
- Loss of profit margin visibility

### 1.3 Business Opportunity

Implementing proper unit conversion will:

- Enable accurate cost tracking at the dish and menu level
- Support data-driven pricing decisions
- Improve inventory management insights
- Facilitate better supplier negotiations based on actual usage patterns

## 2. Stakeholder Analysis

### 2.1 Primary Stakeholders

- **Restaurant Owners/Managers**: Need accurate cost data for pricing and profitability
- **Head Chefs**: Require flexibility in recipe creation without worrying about unit mismatches
- **Financial Controllers**: Need precise cost tracking for budgeting and reporting

### 2.2 Secondary Stakeholders

- **System Administrators**: Will manage unit conversion configurations
- **Kitchen Staff**: Will benefit from clearer ingredient quantity displays
- **Suppliers**: May receive more accurate order quantities

### 2.3 Technical Stakeholders

- **Development Team**: Will implement the conversion system
- **Database Administrators**: Will manage schema changes and data migration
- **QA Team**: Will validate conversion accuracy

## 3. Functional Requirements

### 3.1 Unit Management System

#### FR-001: Unit Category Definition

- The system SHALL support predefined unit categories:
  - Mass: kilogram (kg), gram (g), milligram (mg), pound (lb), ounce (oz)
  - Volume: liter (L), milliliter (ml), cup, tablespoon (tbsp), teaspoon (tsp)
  - Count: piece, dozen, pack
  - Custom: allow user-defined units for special cases

#### FR-002: Unit Conversion Rules

- The system SHALL maintain conversion factors between units within the same category
- The system SHALL prevent conversion between incompatible unit categories
- The system SHALL support bi-directional conversions

#### FR-003: Base Unit Configuration

- Each unit category SHALL have a designated base unit for calculations:
  - Mass: gram (g)
  - Volume: milliliter (ml)
  - Count: piece

### 3.2 Ingredient Pricing Enhancement

#### FR-004: Multi-Unit Pricing Support

- Ingredients SHALL support price definition in their default unit
- The system SHALL calculate equivalent prices for convertible units
- Price history SHALL record the unit along with the price

#### FR-005: Density Configuration

- Ingredients that can be measured by both mass and volume SHALL have optional density values
- The system SHALL use density to convert between mass and volume units
- Common ingredients SHALL have pre-populated density values

### 3.3 Cost Calculation Engine

#### FR-006: Automatic Unit Conversion

- When calculating dish costs, the system SHALL automatically convert ingredient quantities to match pricing units
- The system SHALL use the conversion rules to ensure accurate calculations
- If conversion is not possible, the system SHALL flag the issue

#### FR-007: Cost Breakdown Display

- The system SHALL show cost calculations with unit conversions explicitly:
  - Original quantity and unit
  - Converted quantity and unit
  - Unit price
  - Total cost

### 3.4 Recipe Management Integration

#### FR-008: Unit Validation

- When adding ingredients to dishes, the system SHALL validate unit compatibility
- The system SHALL suggest appropriate units based on the ingredient's category
- The system SHALL warn users about potential conversion issues

#### FR-009: Smart Unit Suggestions

- The system SHALL suggest commonly used units for each ingredient type
- The system SHALL learn from usage patterns to improve suggestions

### 3.5 Reporting and Analytics

#### FR-010: Unit-Aware Reports

- Cost reports SHALL show both original and converted units
- The system SHALL provide unit conversion audit trails
- Reports SHALL highlight dishes with unit conversion warnings

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-001: Conversion Speed

- Unit conversions SHALL complete within 10 milliseconds
- Batch conversions for menu calculations SHALL process 1000 items within 1 second

#### NFR-002: Caching Strategy

- Frequently used conversions SHALL be cached
- Cache invalidation SHALL occur when conversion rules are updated

### 4.2 Accuracy Requirements

#### NFR-003: Precision Standards

- Monetary calculations SHALL maintain precision to 2 decimal places
- Quantity conversions SHALL maintain precision to 3 decimal places
- The system SHALL use decimal arithmetic to prevent floating-point errors

### 4.3 Usability Requirements

#### NFR-004: User Interface

- Unit selection SHALL use intuitive dropdowns with search capability
- Common units SHALL appear at the top of selection lists
- The system SHALL display unit abbreviations consistently

#### NFR-005: Error Handling

- Conversion errors SHALL provide clear, actionable messages
- The system SHALL suggest alternatives when conversions fail

### 4.4 Security Requirements

#### NFR-006: Data Integrity

- Unit conversion rules SHALL be modifiable only by administrators
- All conversion rule changes SHALL be logged for audit purposes

### 4.5 Scalability Requirements

#### NFR-007: Data Volume

- The system SHALL support 10,000+ ingredients with different units
- The system SHALL handle 100,000+ dish-ingredient relationships

## 5. Data Model Changes

### 5.1 New Tables

#### UnitCategory

```sql
- id: string (primary key)
- name: string
- base_unit_id: string (foreign key to Unit)
- created_at: timestamp
- updated_at: timestamp
```

#### Unit

```sql
- id: string (primary key)
- code: string (unique) // e.g., 'kg', 'g', 'ml'
- name_vi: string
- name_en: string
- symbol: string
- category_id: string (foreign key to UnitCategory)
- is_base_unit: boolean
- display_order: integer
- created_at: timestamp
- updated_at: timestamp
```

#### UnitConversion

```sql
- id: string (primary key)
- from_unit_id: string (foreign key to Unit)
- to_unit_id: string (foreign key to Unit)
- conversion_factor: decimal(20,10)
- created_at: timestamp
- updated_at: timestamp
- unique constraint on (from_unit_id, to_unit_id)
```

### 5.2 Modified Tables

#### Ingredient (modifications)

```sql
- unit_id: string (foreign key to Unit) // replaces default_unit
- density: decimal(10,4) // optional, in g/ml
- allow_mass_volume_conversion: boolean default false
```

#### DishIngredient (modifications)

```sql
- unit_id: string (foreign key to Unit) // replaces unit string
- converted_quantity: decimal(10,3) // cached conversion
- conversion_warnings: json // any issues during conversion
```

#### PriceHistory (modifications)

```sql
- unit_id: string (foreign key to Unit)
```

## 6. User Interface Requirements

### 6.1 Ingredient Management UI

#### UI-001: Ingredient Creation/Edit Form

- Unit selection dropdown with category grouping
- Density field (shown only for applicable ingredients)
- Toggle for mass/volume conversion allowance
- Real-time price preview in different units

### 6.2 Recipe Management UI

#### UI-002: Dish Ingredient Addition

- Smart unit dropdown that shows only compatible units
- Visual indicator when unit conversion will occur
- Live cost calculation preview
- Warning badges for conversion issues

#### UI-003: Cost Breakdown View

- Expandable rows showing conversion details
- Color coding for converted vs. native units
- Tooltips explaining conversion calculations

### 6.3 Administrative UI

#### UI-004: Unit Management Interface

- CRUD operations for units and categories
- Bulk conversion rule import/export
- Conversion testing tool
- Audit log viewer

## 7. Validation Rules and Business Logic

### 7.1 Unit Conversion Rules

#### BR-001: Same-Category Conversion

- Conversions are only allowed within the same unit category
- Exception: Mass-volume conversion when density is provided

#### BR-002: Conversion Path Resolution

- The system shall find the shortest conversion path
- Direct conversions take precedence over multi-step conversions

#### BR-003: Circular Reference Prevention

- The system shall prevent circular conversion definitions
- Validation shall occur before saving conversion rules

### 7.2 Pricing Rules

#### BR-004: Price Inheritance

- When ingredient prices are updated, all derived unit prices update automatically
- Price history maintains the original unit for accuracy

#### BR-005: Minimum Quantity Validation

- Converted quantities must be greater than 0.001
- System shall prevent data entry that results in immeasurably small quantities

### 7.3 Data Quality Rules

#### BR-006: Mandatory Unit Assignment

- All ingredients must have a valid unit assigned
- Legacy data migration shall assign appropriate default units

#### BR-007: Conversion Accuracy Verification

- Bi-directional conversions must be mathematically consistent
- A→B→A conversions shall return to the original value (within tolerance)

## 8. Acceptance Criteria

### 8.1 Core Functionality

#### AC-001: Basic Conversion

- GIVEN an ingredient priced at 120,000 VND per kg
- WHEN a dish uses 200g of this ingredient
- THEN the cost calculation shows 24,000 VND (200g × 120,000 VND/kg ÷ 1000)

#### AC-002: Volume to Mass Conversion

- GIVEN oil priced at 50,000 VND per liter with density 0.92 g/ml
- WHEN a dish uses 2 tablespoons (30ml) of oil
- THEN the cost calculation shows 1,500 VND

#### AC-003: Incompatible Unit Handling

- GIVEN an ingredient measured in pieces
- WHEN attempting to use it with gram units
- THEN the system displays a clear error message

### 8.2 User Experience

#### AC-004: Performance

- All unit conversions complete within specified time limits
- No noticeable lag when selecting units or calculating costs

#### AC-005: Data Integrity

- Existing recipes maintain their cost accuracy after migration
- No data loss during the conversion system implementation

### 8.3 Reporting

#### AC-006: Cost Report Accuracy

- Menu cost reports show accurate totals with all conversions applied
- Conversion details are available on demand
- Reports can be exported with full conversion transparency

## 9. Implementation Approach

### 9.1 Phase 1: Foundation (Week 1-2)

1. Design and implement unit management data model
2. Create unit and conversion administration interfaces
3. Populate standard units and conversion rules
4. Develop core conversion engine with caching

### 9.2 Phase 2: Integration (Week 3-4)

1. Migrate existing ingredient and dish data
2. Update ingredient management interfaces
3. Integrate conversion engine with cost calculations
4. Implement validation and error handling

### 9.3 Phase 3: Enhancement (Week 5-6)

1. Add density support and mass-volume conversions
2. Implement smart unit suggestions
3. Create comprehensive reporting features
4. Develop batch processing for menu calculations

### 9.4 Phase 4: Optimization (Week 7-8)

1. Performance tuning and caching optimization
2. User acceptance testing
3. Admin and user training materials
4. Production deployment and monitoring

## 10. Risks and Mitigation

### 10.1 Data Migration Risk

- **Risk**: Existing data may have inconsistent or invalid units
- **Mitigation**: Comprehensive data audit and cleansing process with manual review for exceptions

### 10.2 User Adoption Risk

- **Risk**: Users may resist change from free-text units
- **Mitigation**: Intuitive UI design, comprehensive training, and gradual rollout

### 10.3 Performance Risk

- **Risk**: Complex conversions may impact system performance
- **Mitigation**: Implement intelligent caching and consider pre-calculation strategies

### 10.4 Accuracy Risk

- **Risk**: Conversion errors could impact financial calculations
- **Mitigation**: Extensive testing, decimal arithmetic, and audit trails

## 11. Success Metrics

### 11.1 Accuracy Metrics

- 100% accuracy in unit conversions (validated through automated testing)
- Zero financial discrepancies due to unit conversion errors
- 95% reduction in unit-related user errors

### 11.2 Performance Metrics

- Average conversion time < 10ms
- Menu calculation time < 2 seconds for 100-item menus
- System response time maintained at current levels

### 11.3 Adoption Metrics

- 90% of users successfully using unit conversion within 2 weeks
- 50% reduction in support tickets related to pricing calculations
- 100% of recipes properly configured with valid units within 1 month

## 12. Future Considerations

### 12.1 Supplier Integration

- Automatic unit mapping from supplier catalogs
- Price update workflows that handle unit variations

### 12.2 Regional Variations

- Support for regional unit preferences
- Automatic unit display based on user locale

### 12.3 Advanced Analytics

- Unit optimization recommendations
- Predictive pricing based on unit trends
- Inventory optimization using usage patterns

## 13. Assumptions and Dependencies

### 13.1 Assumptions

- Users have basic understanding of measurement units
- Internet connectivity is available for real-time calculations
- The existing database can accommodate the schema changes

### 13.2 Dependencies

- Current authentication and authorization system remains unchanged
- PostgreSQL database continues to be the primary data store
- The tRPC framework remains the API layer

## 14. Approval and Sign-off

This requirements document requires approval from:

- [ ] Product Owner
- [ ] Technical Lead
- [ ] Head Chef / Operations Manager
- [ ] Financial Controller
- [ ] Development Team Lead

---

**Document History**

- v1.0 - Initial draft - August 10, 2025
