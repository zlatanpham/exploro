import { NextRequest, NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api/middleware";

// Define tag categories with translations
const tagCategories = [
  {
    value: "cooking_method",
    name_vi: "Phương pháp nấu",
    name_en: "Cooking Method",
    description: "How the dish is prepared or cooked",
    examples: [
      "Món chiên (Fried)",
      "Món xào (Stir-fried)",
      "Món nướng (Grilled)",
      "Món hấp (Steamed)",
      "Món luộc (Boiled)",
    ],
  },
  {
    value: "meal_type",
    name_vi: "Loại bữa ăn",
    name_en: "Meal Type",
    description: "Type of meal or course",
    examples: [
      "Món chính (Main dish)",
      "Món phụ (Side dish)",
      "Món khai vị (Appetizer)",
      "Món tráng miệng (Dessert)",
      "Món canh (Soup)",
    ],
  },
  {
    value: "cuisine",
    name_vi: "Ẩm thực vùng miền",
    name_en: "Cuisine",
    description: "Regional or cultural cuisine style",
    examples: [
      "Miền Bắc (Northern)",
      "Miền Trung (Central)",
      "Miền Nam (Southern)",
      "Ẩm thực Huế (Hue cuisine)",
      "Món Hà Nội (Hanoi dishes)",
    ],
  },
  {
    value: "dietary",
    name_vi: "Chế độ ăn",
    name_en: "Dietary",
    description: "Dietary restrictions or preferences",
    examples: [
      "Món chay (Vegetarian)",
      "Thuần chay (Vegan)",
      "Không gluten (Gluten-free)",
      "Ít béo (Low-fat)",
      "Ít đường (Low-sugar)",
    ],
  },
  {
    value: "occasion",
    name_vi: "Dịp lễ",
    name_en: "Occasion",
    description: "Special occasions or holidays",
    examples: [
      "Tết (Lunar New Year)",
      "Giỗ tổ (Ancestor worship)",
      "Cưới hỏi (Wedding)",
      "Sinh nhật (Birthday)",
      "Lễ hội (Festival)",
    ],
  },
  {
    value: "flavor",
    name_vi: "Hương vị",
    name_en: "Flavor",
    description: "Dominant flavor profile",
    examples: [
      "Cay (Spicy)",
      "Ngọt (Sweet)",
      "Chua (Sour)",
      "Mặn (Salty)",
      "Đắng (Bitter)",
      "Umami",
    ],
  },
  {
    value: "temperature",
    name_vi: "Nhiệt độ",
    name_en: "Temperature",
    description: "Serving temperature",
    examples: [
      "Món nóng (Hot dish)",
      "Món nguội (Cold dish)",
      "Món ấm (Warm dish)",
    ],
  },
  {
    value: "texture",
    name_vi: "Kết cấu",
    name_en: "Texture",
    description: "Primary texture of the dish",
    examples: [
      "Giòn (Crispy)",
      "Mềm (Soft)",
      "Dai (Chewy)",
      "Béo ngậy (Rich/Creamy)",
    ],
  },
];

// GET /api/v1/tags/categories - List all tag categories
export const GET = withApiAuth(
  async (request, context) => {
    return NextResponse.json({
      categories: tagCategories,
      total: tagCategories.length,
    });
  },
  { requiredPermission: "read" },
);
