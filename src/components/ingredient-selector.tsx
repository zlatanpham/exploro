"use client";

import * as React from "react";
import {
  SearchableCombobox,
  type ComboboxOption,
} from "@/components/ui/searchable-combobox";
import { useLanguage } from "@/app/(protected)/_context/language";

export interface Ingredient {
  id: string;
  name_vi: string;
  name_en: string | null;
  category: string | null;
  unit?: {
    symbol: string;
    name_vi: string;
    name_en: string;
  } | null;
}

interface IngredientSelectorProps {
  ingredients: Ingredient[];
  value?: string;
  onValueChange?: (ingredientId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCategory?: boolean;
}

const INGREDIENT_CATEGORIES = [
  { value: "vegetables", label_vi: "Rau củ", label_en: "Vegetables" },
  { value: "meat", label_vi: "Thịt", label_en: "Meat" },
  { value: "seafood", label_vi: "Hải sản", label_en: "Seafood" },
  { value: "spices", label_vi: "Gia vị", label_en: "Spices" },
  { value: "dairy", label_vi: "Sữa", label_en: "Dairy" },
  { value: "grains", label_vi: "Ngũ cốc", label_en: "Grains" },
  { value: "fruits", label_vi: "Trái cây", label_en: "Fruits" },
  { value: "sauces", label_vi: "Nước chấm", label_en: "Sauces" },
  { value: "other", label_vi: "Khác", label_en: "Other" },
];

export function IngredientSelector({
  ingredients,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
  showCategory: _showCategory = true,
}: IngredientSelectorProps) {
  const { language, t } = useLanguage();

  // Convert ingredients to combobox options
  const options: ComboboxOption[] = React.useMemo(() => {
    return ingredients.map((ingredient) => {
      const categoryInfo = INGREDIENT_CATEGORIES.find(
        (cat) => cat.value === ingredient.category,
      );
      const categoryLabel = categoryInfo
        ? language === "vi"
          ? categoryInfo.label_vi
          : categoryInfo.label_en
        : ingredient.category || "Other";

      const displayName =
        language === "vi"
          ? ingredient.name_vi
          : ingredient.name_en || ingredient.name_vi;

      return {
        value: ingredient.id,
        label: displayName,
        searchText: `${ingredient.name_vi} ${ingredient.name_en || ""} ${categoryLabel}`,
        category: categoryLabel,
      };
    });
  }, [ingredients, language]);

  return (
    <SearchableCombobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder || "Chọn nguyên liệu..."}
      emptyText={t("message.noResults")}
      searchPlaceholder="Tìm kiếm tên nguyên liệu..."
      disabled={disabled}
      className={className}
      showSearch={true}
      groupByCategory={true}
      maxHeight="400px"
    />
  );
}

export default IngredientSelector;
