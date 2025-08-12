import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api/middleware";

// Define ingredient categories with translations
const ingredientCategories = [
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
  {
    value: "seafood",
    name_vi: "Hải sản",
    name_en: "Seafood",
    description: "Fish, shellfish, and other seafood",
  },
  {
    value: "spices",
    name_vi: "Gia vị",
    name_en: "Spices",
    description: "Herbs, spices, and seasonings",
  },
  {
    value: "dairy",
    name_vi: "Sữa và sản phẩm từ sữa",
    name_en: "Dairy",
    description: "Milk and dairy products",
  },
  {
    value: "grains",
    name_vi: "Ngũ cốc",
    name_en: "Grains",
    description: "Rice, wheat, and other grains",
  },
  {
    value: "fruits",
    name_vi: "Trái cây",
    name_en: "Fruits",
    description: "Fresh and dried fruits",
  },
  {
    value: "sauces",
    name_vi: "Nước mắm, nước chấm",
    name_en: "Sauces",
    description: "Fish sauce, dipping sauces, and condiments",
  },
  {
    value: "other",
    name_vi: "Khác",
    name_en: "Other",
    description: "Other ingredients not in above categories",
  },
];

// GET /api/v1/ingredients/categories - List all ingredient categories
export const GET = withApiAuth(
  async (request, context) => {
    return NextResponse.json({
      categories: ingredientCategories,
      total: ingredientCategories.length,
    });
  },
  { requiredPermission: "read" },
);
