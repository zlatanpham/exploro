import { type PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ConversionResult {
  success: boolean;
  convertedValue?: Decimal;
  error?: string;
  path?: string[];
  usedIngredientMapping?: boolean;
  mappingDetails?: {
    originalUnit: string;
    mappedUnit: string;
    mappingQuantity: Decimal;
  };
}

export class UnitConversionService {
  private prisma: PrismaClient;
  private conversionCache: Map<string, Decimal>;
  private ingredientMappingCache: Map<string, any>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.conversionCache = new Map();
    this.ingredientMappingCache = new Map();
  }

  /**
   * Convert a quantity from one unit to another
   */
  async convert(
    quantity: Decimal | number,
    fromUnitId: string,
    toUnitId: string,
  ): Promise<ConversionResult> {
    // Convert quantity to Decimal if needed
    const quantityDecimal = new Decimal(quantity);

    // If same unit, return as is
    if (fromUnitId === toUnitId) {
      return {
        success: true,
        convertedValue: quantityDecimal,
        path: [fromUnitId],
      };
    }

    try {
      // Check cache first
      const cacheKey = `${fromUnitId}-${toUnitId}`;
      const cachedFactor = this.conversionCache.get(cacheKey);
      if (cachedFactor) {
        return {
          success: true,
          convertedValue: quantityDecimal.mul(cachedFactor),
          path: [fromUnitId, toUnitId],
        };
      }

      // Try direct conversion
      const directConversion = await this.findDirectConversion(fromUnitId, toUnitId);
      if (directConversion) {
        this.conversionCache.set(cacheKey, directConversion.factor);
        return {
          success: true,
          convertedValue: quantityDecimal.mul(directConversion.factor),
          path: [fromUnitId, toUnitId],
        };
      }

      // Try conversion through base unit
      const result = await this.convertThroughBase(quantityDecimal, fromUnitId, toUnitId);
      if (result.success && result.convertedValue) {
        // Calculate and cache the conversion factor
        const factor = result.convertedValue.div(quantityDecimal);
        this.conversionCache.set(cacheKey, factor);
      }
      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Convert a quantity from one unit to another with ingredient-specific mappings
   */
  async convertWithIngredientMapping(
    quantity: Decimal | number,
    fromUnitId: string,
    toUnitId: string,
    ingredientId: string,
  ): Promise<ConversionResult> {
    const quantityDecimal = new Decimal(quantity);

    // If same unit, return as is
    if (fromUnitId === toUnitId) {
      return {
        success: true,
        convertedValue: quantityDecimal,
        path: [fromUnitId],
        usedIngredientMapping: false,
      };
    }

    try {
      // Check if there's an ingredient-specific mapping for this conversion
      const ingredientMapping = await this.findIngredientMapping(ingredientId, fromUnitId);
      
      if (ingredientMapping) {
        // Convert using ingredient mapping
        const mappingResult = await this.convertUsingIngredientMapping(
          quantityDecimal, 
          fromUnitId, 
          toUnitId, 
          ingredientMapping
        );
        if (mappingResult.success) {
          return {
            ...mappingResult,
            usedIngredientMapping: true,
            mappingDetails: {
              originalUnit: fromUnitId,
              mappedUnit: ingredientMapping.measurable_unit_id,
              mappingQuantity: ingredientMapping.quantity,
            },
          };
        }
      }

      // Fallback to standard conversion
      return await this.convert(quantityDecimal, fromUnitId, toUnitId);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        usedIngredientMapping: false,
      };
    }
  }

  /**
   * Find direct conversion between two units
   */
  private async findDirectConversion(fromUnitId: string, toUnitId: string) {
    return await this.prisma.unitConversion.findFirst({
      where: {
        from_unit_id: fromUnitId,
        to_unit_id: toUnitId,
      },
    });
  }

  /**
   * Convert through base unit of the category
   */
  private async convertThroughBase(
    quantity: Decimal,
    fromUnitId: string,
    toUnitId: string,
  ): Promise<ConversionResult> {
    // Get both units with their categories
    const [fromUnit, toUnit] = await Promise.all([
      this.prisma.unit.findUnique({
        where: { id: fromUnitId },
        include: { category: true },
      }),
      this.prisma.unit.findUnique({
        where: { id: toUnitId },
        include: { category: true },
      }),
    ]);

    if (!fromUnit || !toUnit) {
      return {
        success: false,
        error: 'One or both units not found',
      };
    }

    // Check if units are in the same category
    if (fromUnit.category_id !== toUnit.category_id) {
      return {
        success: false,
        error: `Cannot convert between different categories: ${fromUnit.category.name} and ${toUnit.category.name}`,
      };
    }

    // If either unit is the base unit, use the factor_to_base directly
    if (fromUnit.is_base_unit) {
      const convertedValue = quantity.div(toUnit.factor_to_base);
      return {
        success: true,
        convertedValue,
        path: [fromUnitId, toUnitId],
      };
    }

    if (toUnit.is_base_unit) {
      const convertedValue = quantity.mul(fromUnit.factor_to_base);
      return {
        success: true,
        convertedValue,
        path: [fromUnitId, toUnitId],
      };
    }

    // Convert through base unit
    const baseValue = quantity.mul(fromUnit.factor_to_base);
    const convertedValue = baseValue.div(toUnit.factor_to_base);

    // Find base unit for the path
    const baseUnit = await this.prisma.unit.findFirst({
      where: {
        category_id: fromUnit.category_id,
        is_base_unit: true,
      },
    });

    return {
      success: true,
      convertedValue,
      path: [fromUnitId, baseUnit?.id || 'base', toUnitId],
    };
  }

  /**
   * Convert between mass and volume using density
   */
  async convertWithDensity(
    quantity: Decimal | number,
    fromUnitId: string,
    toUnitId: string,
    density: Decimal | number, // g/ml
  ): Promise<ConversionResult> {
    const quantityDecimal = new Decimal(quantity);
    const densityDecimal = new Decimal(density);

    // Get both units with their categories
    const [fromUnit, toUnit] = await Promise.all([
      this.prisma.unit.findUnique({
        where: { id: fromUnitId },
        include: { category: true },
      }),
      this.prisma.unit.findUnique({
        where: { id: toUnitId },
        include: { category: true },
      }),
    ]);

    if (!fromUnit || !toUnit) {
      return {
        success: false,
        error: 'One or both units not found',
      };
    }

    // Check if one is mass and one is volume
    const isMassToVolume = fromUnit.category.name === 'mass' && toUnit.category.name === 'volume';
    const isVolumeToMass = fromUnit.category.name === 'volume' && toUnit.category.name === 'mass';

    if (!isMassToVolume && !isVolumeToMass) {
      return {
        success: false,
        error: 'Density conversion only works between mass and volume units',
      };
    }

    try {
      if (isMassToVolume) {
        // Convert mass to grams
        const gramsResult = await this.convert(quantityDecimal, fromUnitId, 'g');
        if (!gramsResult.success || !gramsResult.convertedValue) {
          return gramsResult;
        }

        // Convert grams to ml using density
        const mlValue = gramsResult.convertedValue.div(densityDecimal);

        // Convert ml to target volume unit
        const mlUnit = await this.prisma.unit.findFirst({
          where: { symbol: 'ml' },
        });
        
        if (!mlUnit) {
          return {
            success: false,
            error: 'ML unit not found in database',
          };
        }

        return await this.convert(mlValue, mlUnit.id, toUnitId);
      } else {
        // Volume to mass
        // Convert volume to ml
        const mlUnit = await this.prisma.unit.findFirst({
          where: { symbol: 'ml' },
        });
        
        if (!mlUnit) {
          return {
            success: false,
            error: 'ML unit not found in database',
          };
        }

        const mlResult = await this.convert(quantityDecimal, fromUnitId, mlUnit.id);
        if (!mlResult.success || !mlResult.convertedValue) {
          return mlResult;
        }

        // Convert ml to grams using density
        const gramsValue = mlResult.convertedValue.mul(densityDecimal);

        // Convert grams to target mass unit
        const gUnit = await this.prisma.unit.findFirst({
          where: { symbol: 'g' },
        });
        
        if (!gUnit) {
          return {
            success: false,
            error: 'Gram unit not found in database',
          };
        }

        return await this.convert(gramsValue, gUnit.id, toUnitId);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Validate if conversion is possible between two units
   */
  async canConvert(fromUnitId: string, toUnitId: string): Promise<boolean> {
    if (fromUnitId === toUnitId) return true;

    const result = await this.convert(new Decimal(1), fromUnitId, toUnitId);
    return result.success;
  }

  /**
   * Get all compatible units for a given unit
   */
  async getCompatibleUnits(unitId: string): Promise<string[]> {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) return [];

    // Get all units in the same category
    const compatibleUnits = await this.prisma.unit.findMany({
      where: { category_id: unit.category_id },
      select: { id: true },
    });

    return compatibleUnits.map((u) => u.id);
  }

  /**
   * Find ingredient-specific mapping for a unit conversion
   */
  private async findIngredientMapping(ingredientId: string, fromUnitId: string) {
    const cacheKey = `${ingredientId}-${fromUnitId}`;
    const cached = this.ingredientMappingCache.get(cacheKey);
    if (cached) return cached;

    const mapping = await this.prisma.ingredientUnitMapping.findFirst({
      where: {
        ingredient_id: ingredientId,
        count_unit_id: fromUnitId,
      },
      include: {
        count_unit: { include: { category: true } },
        measurable_unit: { include: { category: true } },
      },
    });

    // Cache for 1 hour
    if (mapping) {
      this.ingredientMappingCache.set(cacheKey, mapping);
      setTimeout(() => {
        this.ingredientMappingCache.delete(cacheKey);
      }, 60 * 60 * 1000);
    }

    return mapping;
  }

  /**
   * Convert using ingredient-specific mapping
   */
  private async convertUsingIngredientMapping(
    quantity: Decimal,
    fromUnitId: string,
    toUnitId: string,
    mapping: any,
  ): Promise<ConversionResult> {
    try {
      // First convert count unit to measurable unit using the mapping
      // e.g., 2 quả trứng -> 2 * 60g = 120g
      const measurableQuantity = quantity.mul(mapping.quantity);

      // Then convert from measurable unit to target unit if needed
      if (mapping.measurable_unit_id === toUnitId) {
        return {
          success: true,
          convertedValue: measurableQuantity,
          path: [fromUnitId, mapping.measurable_unit_id],
        };
      }

      // Convert from measurable unit to target unit using standard conversion
      return await this.convert(measurableQuantity, mapping.measurable_unit_id, toUnitId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all ingredient mappings for a specific ingredient
   */
  async getIngredientMappings(ingredientId: string) {
    return await this.prisma.ingredientUnitMapping.findMany({
      where: { ingredient_id: ingredientId },
      include: {
        count_unit: true,
        measurable_unit: true,
      },
    });
  }

  /**
   * Create or update ingredient unit mapping
   */
  async setIngredientMapping(
    ingredientId: string,
    countUnitId: string,
    measurableUnitId: string,
    quantity: Decimal | number,
  ) {
    const quantityDecimal = new Decimal(quantity);
    
    // Validate that count unit is from count category and measurable unit is from mass/volume
    const [countUnit, measurableUnit] = await Promise.all([
      this.prisma.unit.findUnique({
        where: { id: countUnitId },
        include: { category: true },
      }),
      this.prisma.unit.findUnique({
        where: { id: measurableUnitId },
        include: { category: true },
      }),
    ]);

    if (!countUnit || !measurableUnit) {
      throw new Error('One or both units not found');
    }

    if (countUnit.category.name !== 'count') {
      throw new Error('Count unit must be from the count category');
    }

    if (!['mass', 'volume'].includes(measurableUnit.category.name)) {
      throw new Error('Measurable unit must be from mass or volume category');
    }

    // Create or update the mapping
    const mapping = await this.prisma.ingredientUnitMapping.upsert({
      where: {
        ingredient_id_count_unit_id: {
          ingredient_id: ingredientId,
          count_unit_id: countUnitId,
        },
      },
      update: {
        measurable_unit_id: measurableUnitId,
        quantity: quantityDecimal,
      },
      create: {
        ingredient_id: ingredientId,
        count_unit_id: countUnitId,
        measurable_unit_id: measurableUnitId,
        quantity: quantityDecimal,
      },
    });

    // Clear cache for this mapping
    const cacheKey = `${ingredientId}-${countUnitId}`;
    this.ingredientMappingCache.delete(cacheKey);

    return mapping;
  }

  /**
   * Delete ingredient unit mapping
   */
  async deleteIngredientMapping(ingredientId: string, countUnitId: string) {
    const deleted = await this.prisma.ingredientUnitMapping.delete({
      where: {
        ingredient_id_count_unit_id: {
          ingredient_id: ingredientId,
          count_unit_id: countUnitId,
        },
      },
    });

    // Clear cache
    const cacheKey = `${ingredientId}-${countUnitId}`;
    this.ingredientMappingCache.delete(cacheKey);

    return deleted;
  }

  /**
   * Clear the conversion cache
   */
  clearCache(): void {
    this.conversionCache.clear();
    this.ingredientMappingCache.clear();
  }
}