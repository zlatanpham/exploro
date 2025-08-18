"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

type Language = "vi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  // Navigation
  "nav.dishes": {
    vi: "Món ăn",
    en: "Dishes",
  },
  "nav.ingredients": {
    vi: "Nguyên liệu",
    en: "Ingredients",
  },
  "nav.menus": {
    vi: "Thực đơn",
    en: "Menus",
  },
  "nav.favorites": {
    vi: "Yêu thích",
    en: "Favorites",
  },
  "nav.tags": {
    vi: "Nhãn",
    en: "Tags",
  },
  "nav.admin": {
    vi: "Quản trị",
    en: "Admin",
  },

  // Common actions
  "action.create": {
    vi: "Tạo mới",
    en: "Create",
  },
  "action.edit": {
    vi: "Sửa",
    en: "Edit",
  },
  "action.delete": {
    vi: "Xóa",
    en: "Delete",
  },
  "action.save": {
    vi: "Lưu",
    en: "Save",
  },
  "action.cancel": {
    vi: "Hủy",
    en: "Cancel",
  },
  "action.search": {
    vi: "Tìm kiếm",
    en: "Search",
  },
  "action.filter": {
    vi: "Lọc",
    en: "Filter",
  },
  "action.share": {
    vi: "Chia sẻ",
    en: "Share",
  },
  "action.duplicate": {
    vi: "Nhân bản",
    en: "Duplicate",
  },

  // Dish fields
  "dish.name": {
    vi: "Tên món",
    en: "Dish name",
  },
  "dish.description": {
    vi: "Mô tả",
    en: "Description",
  },
  "dish.difficulty": {
    vi: "Độ khó",
    en: "Difficulty",
  },
  "dish.difficulty.easy": {
    vi: "Dễ",
    en: "Easy",
  },
  "dish.difficulty.medium": {
    vi: "Trung bình",
    en: "Medium",
  },
  "dish.difficulty.hard": {
    vi: "Khó",
    en: "Hard",
  },
  "dish.cookTime": {
    vi: "Thời gian nấu",
    en: "Cook time",
  },
  "dish.prepTime": {
    vi: "Thời gian chuẩn bị",
    en: "Prep time",
  },
  "dish.servings": {
    vi: "Khẩu phần",
    en: "Servings",
  },
  "dish.instructions": {
    vi: "Hướng dẫn",
    en: "Instructions",
  },
  "dish.ingredients": {
    vi: "Nguyên liệu",
    en: "Ingredients",
  },
  "dish.totalCost": {
    vi: "Tổng chi phí",
    en: "Total cost",
  },

  // Ingredient fields
  "ingredient.name": {
    vi: "Tên nguyên liệu",
    en: "Ingredient name",
  },
  "ingredient.category": {
    vi: "Danh mục",
    en: "Category",
  },
  "ingredient.unit": {
    vi: "Đơn vị",
    en: "Unit",
  },
  "ingredient.price": {
    vi: "Giá",
    en: "Price",
  },
  "ingredient.quantity": {
    vi: "Số lượng",
    en: "Quantity",
  },
  "ingredient.seasonal": {
    vi: "Theo mùa",
    en: "Seasonal",
  },
  "ingredient.lastUpdated": {
    vi: "Cập nhật lần cuối",
    en: "Last updated",
  },

  // Menu fields
  "menu.name": {
    vi: "Tên thực đơn",
    en: "Menu name",
  },
  "menu.description": {
    vi: "Mô tả",
    en: "Description",
  },
  "menu.dateRange": {
    vi: "Thời gian",
    en: "Date range",
  },
  "menu.servings": {
    vi: "Số người",
    en: "Servings",
  },
  "menu.visibility": {
    vi: "Hiển thị",
    en: "Visibility",
  },
  "menu.visibility.private": {
    vi: "Riêng tư",
    en: "Private",
  },
  "menu.visibility.public": {
    vi: "Công khai",
    en: "Public",
  },
  "menu.totalCost": {
    vi: "Tổng chi phí",
    en: "Total cost",
  },
  "menu.costPerPerson": {
    vi: "Chi phí/người",
    en: "Cost per person",
  },
  "menu.shoppingList": {
    vi: "Danh sách mua sắm",
    en: "Shopping list",
  },

  // Meal groups
  "meal.breakfast": {
    vi: "Bữa sáng",
    en: "Breakfast",
  },
  "meal.lunch": {
    vi: "Bữa trưa",
    en: "Lunch",
  },
  "meal.dinner": {
    vi: "Bữa tối",
    en: "Dinner",
  },
  "meal.snack": {
    vi: "Ăn vặt",
    en: "Snack",
  },

  // Time units
  "time.minutes": {
    vi: "phút",
    en: "minutes",
  },
  "time.hours": {
    vi: "giờ",
    en: "hours",
  },
  "time.people": {
    vi: "người",
    en: "people",
  },

  // Messages
  "message.loading": {
    vi: "Đang tải...",
    en: "Loading...",
  },
  "message.noData": {
    vi: "Không có dữ liệu",
    en: "No data",
  },
  "message.error": {
    vi: "Có lỗi xảy ra",
    en: "An error occurred",
  },
  "message.success": {
    vi: "Thành công",
    en: "Success",
  },
  "message.confirmDelete": {
    vi: "Bạn có chắc chắn muốn xóa?",
    en: "Are you sure you want to delete?",
  },
  "message.adminOnly": {
    vi: "Chỉ dành cho quản trị viên",
    en: "Admin only",
  },
  "message.all": {
    vi: "Tất cả",
    en: "All",
  },
  "message.basicInfo": {
    vi: "Thông tin cơ bản",
    en: "Basic information",
  },
  "action.actions": {
    vi: "Hành động",
    en: "Actions",
  },
  "action.add": {
    vi: "Thêm",
    en: "Add",
  },
  "action.loadMore": {
    vi: "Tải thêm",
    en: "Load more",
  },
  "status.active": {
    vi: "Hoạt động",
    en: "Active",
  },
  "status.inactive": {
    vi: "Không hoạt động",
    en: "Inactive",
  },
  "common.status": {
    vi: "Trạng thái",
    en: "Status",
  },
  "common.tags": {
    vi: "Nhãn",
    en: "Tags",
  },
  "tag.name": {
    vi: "Tên nhãn",
    en: "Tag name",
  },
  "action.back": {
    vi: "Quay lại",
    en: "Back",
  },
  "action.favorite": {
    vi: "Yêu thích",
    en: "Favorite",
  },
  "action.unfavorite": {
    vi: "Bỏ yêu thích",
    en: "Unfavorite",
  },
  "action.view": {
    vi: "Xem",
    en: "View",
  },
  "action.browse": {
    vi: "Duyệt",
    en: "Browse",
  },
  "action.select": {
    vi: "Chọn",
    en: "Select",
  },
  "menu.browsePublic": {
    vi: "Duyệt thực đơn công khai",
    en: "Browse public menus",
  },
  "menu.browsePublicDescription": {
    vi: "Khám phá thực đơn được chia sẻ bởi cộng đồng",
    en: "Discover menus shared by the community",
  },
  "menu.noDateSet": {
    vi: "Chưa đặt ngày",
    en: "No date set",
  },
  "menu.dishes": {
    vi: "món ăn",
    en: "dishes",
  },
  "menu.noMenus": {
    vi: "Bạn chưa có thực đơn nào",
    en: "You don't have any menus yet",
  },
  "menu.createFirst": {
    vi: "Tạo thực đơn đầu tiên",
    en: "Create your first menu",
  },
  "menu.createDescription": {
    vi: "Tạo thực đơn mới để bắt đầu lập kế hoạch bữa ăn",
    en: "Create a new menu to start planning your meals",
  },
  "menu.namePlaceholder": {
    vi: "VD: Thực đơn tuần này",
    en: "E.g., This week's menu",
  },
  "menu.descriptionPlaceholder": {
    vi: "Mô tả ngắn về thực đơn này",
    en: "Brief description of this menu",
  },
  "favorites.empty": {
    vi: "Bạn chưa có món ăn yêu thích nào",
    en: "You don't have any favorite dishes yet",
  },
  "favorites.browseDishes": {
    vi: "Duyệt món ăn",
    en: "Browse dishes",
  },
  "menu.weeklyView": {
    vi: "Xem theo tuần",
    en: "Weekly view",
  },
  "menu.listView": {
    vi: "Xem danh sách",
    en: "List view",
  },
  "meal.day": {
    vi: "Ngày",
    en: "Day",
  },
  "meal.mealType": {
    vi: "Bữa ăn",
    en: "Meal type",
  },
  "action.download": {
    vi: "Tải xuống",
    en: "Download",
  },
  "menu.usedIn": {
    vi: "Dùng trong",
    en: "Used in",
  },
  "menu.details": {
    vi: "Chi tiết",
    en: "Details",
  },
  "menu.basicInfo": {
    vi: "Thông tin cơ bản",
    en: "Basic information",
  },
  "menu.startDate": {
    vi: "Ngày bắt đầu",
    en: "Start date",
  },
  "menu.endDate": {
    vi: "Ngày kết thúc",
    en: "End date",
  },
  "menu.weeklyPlan": {
    vi: "Kế hoạch tuần",
    en: "Weekly plan",
  },
  "menu.addDish": {
    vi: "Thêm món ăn",
    en: "Add dish",
  },
  "menu.searchAndAddDishes": {
    vi: "Tìm kiếm và thêm món ăn vào thực đơn",
    en: "Search and add dishes to the menu",
  },
  "menu.selectDay": {
    vi: "Chọn ngày",
    en: "Select day",
  },
  "menu.selectMeal": {
    vi: "Chọn bữa ăn",
    en: "Select meal",
  },
  "menu.searchDishes": {
    vi: "Tìm kiếm món ăn...",
    en: "Search dishes...",
  },
  "menu.noDishesForDay": {
    vi: "Chưa có món ăn cho ngày này",
    en: "No dishes for this day",
  },
  "menu.allDishes": {
    vi: "Tất cả món ăn",
    en: "All dishes",
  },
  "menu.noDishes": {
    vi: "Chưa có món ăn nào trong thực đơn",
    en: "No dishes in the menu yet",
  },

  // Admin - Ingredient Mappings
  "admin.ingredientMappings": {
    vi: "Quy đổi đơn vị nguyên liệu",
    en: "Ingredient Unit Mappings",
  },
  "admin.ingredientMappingsDescription": {
    vi: "Quản lý quy đổi từ đơn vị đếm sang đơn vị cân đo cho từng nguyên liệu",
    en: "Manage conversions from count units to measurable units for each ingredient",
  },
  "admin.noMappings": {
    vi: "Chưa có quy đổi nào",
    en: "No mappings yet",
  },
  "admin.noMappingsDescription": {
    vi: "Tạo quy đổi đầu tiên để bắt đầu tính toán giá chính xác hơn",
    en: "Create your first mapping to start more accurate price calculations",
  },
  
  // Unit-related translations
  "unit.countUnit": {
    vi: "Đơn vị đếm",
    en: "Count Unit",
  },
  "unit.measurableUnit": {
    vi: "Đơn vị cân đo",
    en: "Measurable Unit",
  },
  "unit.fromUnit": {
    vi: "Từ đơn vị",
    en: "From Unit",
  },
  "unit.toUnit": {
    vi: "Sang đơn vị",
    en: "To Unit",
  },
  "unit.mass": {
    vi: "Khối lượng",
    en: "Mass",
  },
  "unit.volume": {
    vi: "Thể tích",
    en: "Volume",
  },
  
  // Actions for mappings
  "action.addMapping": {
    vi: "Thêm quy đổi",
    en: "Add Mapping",
  },
  "action.testConversion": {
    vi: "Test quy đổi",
    en: "Test Conversion",
  },
  "action.selectIngredient": {
    vi: "Chọn nguyên liệu",
    en: "Select ingredient",
  },
  "action.selectUnit": {
    vi: "Chọn đơn vị",
    en: "Select unit",
  },
  "action.selectCountUnit": {
    vi: "Chọn đơn vị đếm",
    en: "Select count unit",
  },
  
  // Conversion results
  "conversion.result": {
    vi: "Kết quả quy đổi",
    en: "Conversion result",
  },
  "conversion.usedMapping": {
    vi: "Sử dụng quy đổi riêng",
    en: "Used ingredient mapping",
  },
  
  // Common terms
  "common.yes": {
    vi: "Có",
    en: "Yes",
  },
  "common.no": {
    vi: "Không",
    en: "No",
  },
  "common.result": {
    vi: "Kết quả",
    en: "Result",
  },
  "common.success": {
    vi: "Thành công",
    en: "Success",
  },
  "common.error": {
    vi: "Lỗi",
    en: "Error",
  },
  "common.quantity": {
    vi: "Số lượng",
    en: "Quantity",
  },
  
  // Additional actions
  "action.show": {
    vi: "Hiện",
    en: "Show",
  },
  "action.hide": {
    vi: "Ẩn",
    en: "Hide",
  },
  
  // Additional admin
  "admin.mappingExample": {
    vi: "Ví dụ",
    en: "Example",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>("vi");
  const updatePreference = api.user.updateLanguagePreference.useMutation();

  useEffect(() => {
    if (session?.user?.language_preference) {
      setLanguageState(session.user.language_preference as Language);
    }
  }, [session]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (session?.user) {
      void updatePreference.mutate({ language: lang });
    }
  };

  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) return key;
    return translation[language] ?? translation.vi ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a default context when outside provider (for admin pages that check role before render)
    return {
      language: "vi" as Language,
      setLanguage: () => undefined,
      t: (key: string) => key,
    };
  }
  return context;
}
