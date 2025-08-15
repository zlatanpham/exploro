import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api/middleware";

// Define dish-related categories
const dishCategories = {
  difficulty: [
    {
      value: "easy",
      name_vi: "Dễ",
      name_en: "Easy",
      description:
        "Simple dishes that can be prepared quickly with basic techniques",
    },
    {
      value: "medium",
      name_vi: "Trung bình",
      name_en: "Medium",
      description: "Dishes requiring moderate skill and preparation time",
    },
    {
      value: "hard",
      name_vi: "Khó",
      name_en: "Hard",
      description:
        "Complex dishes requiring advanced techniques and longer preparation",
    },
  ],
  status: [
    {
      value: "active",
      name_vi: "Đang sử dụng",
      name_en: "Active",
      description: "Dish is currently available and in use",
    },
    {
      value: "inactive",
      name_vi: "Không sử dụng",
      name_en: "Inactive",
      description: "Dish is archived or not currently available",
    },
  ],
  meal_groups: [
    {
      value: "breakfast",
      name_vi: "Bữa sáng",
      name_en: "Breakfast",
      description: "Morning meal dishes",
    },
    {
      value: "lunch",
      name_vi: "Bữa trưa",
      name_en: "Lunch",
      description: "Midday meal dishes",
    },
    {
      value: "dinner",
      name_vi: "Bữa tối",
      name_en: "Dinner",
      description: "Evening meal dishes",
    },
    {
      value: "snack",
      name_vi: "Ăn vặt",
      name_en: "Snack",
      description: "Light dishes or appetizers",
    },
  ],
};

// GET /api/v1/dishes/categories - List all dish categories
export const GET = withApiAuth(
  async (request, _context) => {
    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get("type");

    // If specific type is requested, return only that category
    if (type && type in dishCategories) {
      return NextResponse.json({
        [type]: dishCategories[type as keyof typeof dishCategories],
        total: dishCategories[type as keyof typeof dishCategories].length,
      });
    }

    // Return all categories
    return NextResponse.json({
      categories: dishCategories,
      types: Object.keys(dishCategories),
    });
  },
  { requiredPermission: "read" },
);
