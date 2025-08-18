# Business Requirements: Flexible Unit Conversions for Ingredient-Specific Price Calculations

**Document ID**: BRD-20250818-001  
**Created**: August 18, 2025  
**Business Analyst**: Claude  
**Status**: Draft  
**Priority**: High  

## Executive Summary

This document outlines business requirements for enhancing Exploro's unit conversion system to support ingredient-specific unit mappings for accurate price calculations. The enhancement will enable count units (quả, chai, lon, hộp) to have measurable equivalents (kg, g, ml, l) that vary by ingredient, improving pricing accuracy while maintaining user-friendly recipe entry.

### Key Business Value
- **Pricing Accuracy**: Improve cost calculations from ~70% to ~95% accuracy
- **User Experience**: Maintain familiar Vietnamese units for recipe entry
- **Business Intelligence**: Enable accurate meal planning cost analysis
- **Scalability**: Support diverse ingredient types with appropriate unit mappings

## 1. Business Context and Problem Statement

### 1.1 Current System Analysis

**Existing Unit Categories:**
- **Mass Units**: kg, g, mg, tấn (with proper conversion factors)
- **Volume Units**: l, ml, thìa, thìa nhỏ, chén, bát, tô (with proper conversion factors)  
- **Count Units**: cái, quả, bó, nắm, gói, hộp, chai, lon, tép, lá, cọng, lát, giọt (all with factor_to_base: 1)

**Current Database Schema Supports:**
- Unit categories with base units and conversion factors
- Direct unit conversions through UnitConversion table
- Ingredient pricing in specific units (unit_id on Ingredient)
- Density-based mass-volume conversions (density field on Ingredient)
- Dish ingredients with different units than ingredient pricing unit

### 1.2 Core Business Problem

**Current Limitation**: Count units like "quả trứng", "chai tương ớt", "lon cà chua" are treated as pure counting units without measurable equivalents, leading to:

1. **Inaccurate Price Calculations**: 
   - 1 quả trứng ≠ standardized weight for costing
   - 1 chai tương ớt ≠ measurable volume for price per ml
   - 1 hộp sữa ≠ standardized volume for accurate costing

2. **Business Impact**:
   - Menu pricing decisions based on incomplete cost data
   - Inability to accurately compare ingredient costs across suppliers
   - Poor meal planning budget accuracy for end users
   - Inconsistent cost analysis for restaurant/food service planning

3. **User Experience Issues**:
   - Users expect to enter "2 quả trứng" but need accurate pricing
   - Traditional Vietnamese units must be preserved for familiarity
   - System should handle both convenience and accuracy seamlessly

### 1.3 Business Opportunity

**Market Research Insights:**
- Vietnamese home cooks think in traditional units (quả, chai, lon)
- Professional kitchens need accurate ingredient costing
- Meal planning apps with accurate pricing have 40% higher user retention
- Cost-conscious consumers increasingly use meal planning for budget management

## 2. Stakeholder Analysis

### 2.1 Primary Stakeholders

**Home Cooks (End Users)**
- *Needs*: Familiar units, accurate meal costs, budget planning
- *Pain Points*: Difficulty estimating meal costs, unfamiliar metric units
- *Success Criteria*: Can plan meals within budget using traditional units

**Restaurant/Food Service Operators**
- *Needs*: Accurate ingredient costing, portion control, menu pricing
- *Pain Points*: Inaccurate cost calculations, manual unit conversions
- *Success Criteria*: Precise cost analysis for menu profitability

**Meal Planning Enthusiasts**
- *Needs*: Detailed cost breakdowns, ingredient optimization
- *Pain Points*: Limited cost visibility, inability to optimize shopping
- *Success Criteria*: Can optimize meals for cost and nutrition

### 2.2 Secondary Stakeholders

**Content Managers**
- *Needs*: Easy ingredient data management, bulk unit mapping
- *Impact*: Must configure ingredient-specific unit mappings
- *Success Criteria*: Efficient workflow for setting up ingredient conversions

**System Administrators**
- *Needs*: Data integrity, migration tools, performance optimization
- *Impact*: Responsible for system migration and maintenance
- *Success Criteria*: Smooth migration with zero data loss

## 3. Functional Requirements

### 3.1 Core Enhancement: Ingredient-Specific Unit Mappings

**REQ-001: Ingredient Unit Mapping System**
- **Description**: Enable ingredients to define specific conversion rates for count units to measurable units
- **Acceptance Criteria**:
  - Each ingredient can specify mappings: count unit → measurable unit + quantity
  - Example: "Trứng gà" → "1 quả = 60g", "Tương ớt" → "1 chai = 500ml"
  - Mappings are ingredient-specific, not global unit conversions
  - System validates mappings (count units can only map to mass/volume units)

**REQ-002: Enhanced Price Calculation Engine**
- **Description**: Modify pricing calculations to use ingredient-specific unit mappings
- **Acceptance Criteria**:
  - When dish ingredient uses count unit, system looks up ingredient-specific mapping
  - If mapping exists, converts to measurable unit for price calculation
  - Falls back to current conversion logic if no ingredient-specific mapping
  - Maintains pricing accuracy for all existing ingredients without mappings

**REQ-003: Recipe Unit Flexibility**
- **Description**: Preserve user-friendly unit entry while enabling accurate pricing
- **Acceptance Criteria**:
  - Users can still enter "2 quả trứng" in recipes
  - System automatically converts to "120g" for pricing using ingredient mapping
  - Recipe display shows original user-entered units
  - Cost calculations use converted measurable units

### 3.2 Data Model Enhancements

**REQ-004: Ingredient Unit Mapping Table**
- **Description**: New database table to store ingredient-specific unit conversions
- **Schema Requirements**:
```sql
IngredientUnitMapping {
  id: String (primary key)
  ingredient_id: String (foreign key to Ingredient)
  count_unit_id: String (foreign key to Unit)
  measurable_unit_id: String (foreign key to Unit)
  quantity: Decimal (amount of measurable unit per count unit)
  created_at: DateTime
  updated_at: DateTime
}
```
- **Constraints**:
  - Unique constraint on (ingredient_id, count_unit_id)
  - count_unit_id must be from "count" category
  - measurable_unit_id must be from "mass" or "volume" category

**REQ-005: Enhanced Unit Conversion Service**
- **Description**: Extend UnitConversionService to support ingredient-specific mappings
- **Acceptance Criteria**:
  - New method: `convertWithIngredientMapping(quantity, fromUnit, toUnit, ingredientId)`
  - Checks for ingredient-specific mapping before standard conversion
  - Maintains backward compatibility with existing conversion logic
  - Caches ingredient mappings for performance

### 3.3 User Interface Requirements

**REQ-006: Ingredient Management Interface**
- **Description**: Admin interface for managing ingredient-specific unit mappings
- **Acceptance Criteria**:
  - Add/edit ingredient mappings in ingredient management page
  - Dropdown selection of count units and measurable units
  - Quantity input with validation
  - Bulk mapping tools for similar ingredients
  - Preview of cost calculation impact

**REQ-007: Recipe Cost Display Enhancement**
- **Description**: Enhanced cost breakdown showing unit conversion details
- **Acceptance Criteria**:
  - Show original recipe units in ingredient list
  - Display converted units and quantities in cost breakdown
  - Tooltip explaining conversion (e.g., "2 quả trứng = 120g")
  - Total cost calculation uses converted quantities

### 3.4 Administrative Requirements

**REQ-008: Data Migration Tools**
- **Description**: Tools for migrating existing data and setting up common mappings
- **Acceptance Criteria**:
  - Script to analyze existing ingredient usage patterns
  - Bulk import tool for common Vietnamese ingredient mappings
  - Validation tools to check mapping consistency
  - Rollback capabilities for migration testing

**REQ-009: Audit and Monitoring**
- **Description**: Tracking and monitoring of unit conversions for accuracy
- **Acceptance Criteria**:
  - Log all ingredient mapping usage for analysis
  - Monitor conversion success rates
  - Track pricing accuracy improvements
  - Alert system for missing mappings on high-usage ingredients

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

**REQ-010: Conversion Performance**
- **Target**: Ingredient mapping lookups under 50ms
- **Caching**: Ingredient mappings cached for 24 hours
- **Database**: Proper indexing on ingredient_id and unit_id combinations

**REQ-011: Storage Efficiency**
- **Growth**: Support for 10,000+ ingredients with 3-5 mappings each
- **Indexing**: Optimized queries for mapping lookups
- **Archival**: Soft delete for historical mapping changes

### 4.2 Usability Requirements

**REQ-012: User Experience**
- **Learning Curve**: No change to current recipe entry workflow
- **Familiarity**: Preserve traditional Vietnamese unit names and symbols
- **Feedback**: Clear indication when conversions are applied
- **Accessibility**: Support for Vietnamese language throughout

### 4.3 Reliability Requirements

**REQ-013: Data Integrity**
- **Validation**: Prevent invalid unit category mappings
- **Consistency**: Ensure mapping changes don't break existing recipes
- **Backup**: Full rollback capability for mapping changes
- **Testing**: Comprehensive test coverage for conversion scenarios

## 5. Success Metrics

### 5.1 Primary KPIs

**Pricing Accuracy**
- *Current State*: ~70% accuracy in cost calculations
- *Target State*: 95%+ accuracy for recipes using ingredient mappings
- *Measurement*: Compare calculated costs with actual ingredient costs

**User Engagement**
- *Target*: Maintain current recipe creation rate while improving cost visibility
- *Measurement*: Recipe creation metrics, cost calculation usage

**System Performance**
- *Target*: No degradation in page load times
- *Measurement*: API response times for dish cost calculations

### 5.2 Secondary Metrics

**Content Quality**
- *Target*: 80% of high-usage ingredients have mappings within 3 months
- *Measurement*: Percentage of ingredient usage covered by mappings

**User Satisfaction**
- *Target*: Maintain 90%+ satisfaction with recipe entry experience
- *Measurement*: User feedback on unit conversion accuracy

## 6. Implementation Approach

### 6.1 Phased Rollout Strategy

**Phase 1: Foundation (Month 1)**
- Implement IngredientUnitMapping table and relationships
- Extend UnitConversionService with ingredient mapping logic
- Create basic admin interface for mapping management
- Set up common Vietnamese ingredient mappings (eggs, bottles, cans)

**Phase 2: Integration (Month 2)**
- Update dish cost calculation APIs to use ingredient mappings
- Enhance recipe display to show conversion details
- Implement bulk mapping tools for content managers
- Add validation and error handling

**Phase 3: Optimization (Month 3)**
- Performance optimization and caching
- Advanced admin tools (bulk import, analysis)
- User interface refinements based on feedback
- Comprehensive testing and monitoring

### 6.2 Risk Mitigation

**Technical Risks**:
- *Risk*: Complex conversion logic affecting performance
- *Mitigation*: Comprehensive caching strategy and database optimization

**Business Risks**:
- *Risk*: User confusion with unit conversions
- *Mitigation*: Clear UI feedback and gradual feature rollout

**Data Risks**:
- *Risk*: Incorrect mappings leading to wrong cost calculations
- *Mitigation*: Validation tools, admin review process, and rollback capabilities

## 7. Migration Strategy

### 7.1 Data Migration Plan

**Step 1: Schema Updates**
- Deploy IngredientUnitMapping table
- Add necessary indexes and constraints
- Update application code for new relationships

**Step 2: Common Mappings Setup**
- Import standard Vietnamese ingredient mappings
- Validate mappings against existing ingredient data
- Test cost calculation accuracy with sample recipes

**Step 3: Gradual Rollout**
- Enable mappings for admin users first
- Roll out to content managers for validation
- Full rollout after accuracy verification

### 7.2 Rollback Strategy

**Immediate Rollback**: Feature flag to disable ingredient mapping usage
**Data Rollback**: Preserve existing conversion logic as fallback
**Full Rollback**: Database migration scripts to reverse schema changes

## 8. Assumptions and Constraints

### 8.1 Assumptions

1. Users will continue preferring traditional Vietnamese units for recipe entry
2. Ingredient suppliers provide consistent sizing for packaged goods
3. Cost accuracy improvement will lead to increased user engagement
4. Admin users can efficiently manage ingredient mappings

### 8.2 Constraints

**Technical Constraints**:
- Must maintain backward compatibility with existing unit system
- Cannot break existing recipe data or user workflows
- Database performance must remain within current SLA

**Business Constraints**:
- Implementation must be completed within 3-month timeline
- No additional licensing costs for enhanced unit conversion
- Must support both Vietnamese and English interfaces

**Regulatory Constraints**:
- Ingredient information must comply with Vietnamese food labeling standards
- Cost calculations must be transparent and auditable

## 9. Acceptance Criteria Summary

**System Must**:
1. Enable ingredient-specific unit mappings (count → measurable units)
2. Maintain existing user experience for recipe entry
3. Improve pricing accuracy to 95%+ for mapped ingredients
4. Provide admin tools for mapping management
5. Support bulk operations for efficiency
6. Maintain system performance standards

**System Must Not**:
1. Break existing recipes or cost calculations
2. Require users to learn new unit entry methods
3. Degrade system performance or user experience
4. Create data inconsistencies or integrity issues

## 10. Conclusion

This enhancement represents a significant improvement to Exploro's value proposition by combining the familiarity of traditional Vietnamese units with the accuracy requirements of modern meal planning and cost management. The ingredient-specific unit mapping system addresses the core limitation of count units while preserving the user experience that makes Exploro accessible to Vietnamese home cooks.

The phased implementation approach ensures minimal risk while delivering immediate value through improved cost calculations for common ingredients. Success in this enhancement will position Exploro as the leading meal planning solution for accuracy-conscious Vietnamese users while maintaining its ease-of-use advantage.

---

**Document Status**: Ready for stakeholder review  
**Next Steps**: Technical architecture review and development sprint planning  
**Review Date**: August 25, 2025