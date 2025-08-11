"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useLanguage } from "../../../_context/language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Search,
  Calendar,
  Clock,
  Users,
  Eye,
  EyeOff,
  GripVertical,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAYS_VI = [
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
  "Chủ nhật",
];
const MEAL_GROUPS = ["breakfast", "lunch", "dinner", "snack"];

interface MenuDish {
  id?: string;
  dish_id: string;
  dish?: any;
  meal_group?: string;
  day_index?: number;
  quantity: number;
  order_index?: number;
}

export default function MenuEditPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const menuId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    servings: 4,
    visibility: "private" as "private" | "public",
    start_date: "",
    end_date: "",
  });

  const [menuDishes, setMenuDishes] = useState<MenuDish[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMealGroup, setSelectedMealGroup] = useState<string | null>(
    null,
  );

  // Fetch menu data
  const { data: menu, isLoading } = api.menu.getById.useQuery({ id: menuId });

  // Update form data when menu loads
  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        description: menu.description ?? "",
        servings: menu.servings,
        visibility: menu.visibility as "private" | "public",
        start_date: menu.start_date
          ? new Date(menu.start_date).toISOString().split("T")[0]
          : "",
        end_date: menu.end_date
          ? new Date(menu.end_date).toISOString().split("T")[0]
          : "",
      });
      setMenuDishes(
        menu.MenuDish.map((md: any) => ({
          id: md.id,
          dish_id: md.dish_id,
          dish: md.dish,
          meal_group: md.meal_group,
          day_index: md.day_index,
          quantity: md.quantity,
          order_index: md.order_index,
        })),
      );
    }
  }, [menu]);

  // Search dishes
  const { data: searchResults } = api.dish.getAll.useQuery(
    {
      search: searchQuery,
      limit: 10,
    },
    {
      enabled: searchQuery.length > 0,
    },
  );

  // Update menu mutation
  const updateMenu = api.menu.update.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      router.push(`/menus/${menuId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    const menuData = {
      ...formData,
      start_date: formData.start_date
        ? new Date(formData.start_date)
        : undefined,
      end_date: formData.end_date ? new Date(formData.end_date) : undefined,
    };

    const dishesData = menuDishes.map((md, index) => ({
      dish_id: md.dish_id,
      meal_group: md.meal_group,
      day_index: md.day_index,
      quantity: md.quantity,
      order_index: index,
    }));

    updateMenu.mutate({
      id: menuId,
      menu: menuData,
      dishes: dishesData,
    });
  };

  const addDishToMenu = (dish: any) => {
    const newMenuDish: MenuDish = {
      dish_id: dish.id,
      dish: dish,
      meal_group: selectedMealGroup ?? undefined,
      day_index: selectedDay ?? undefined,
      quantity: 1,
    };
    setMenuDishes([...menuDishes, newMenuDish]);
    setIsAddDishOpen(false);
    setSearchQuery("");
  };

  const removeDishFromMenu = (index: number) => {
    setMenuDishes(menuDishes.filter((_, i) => i !== index));
  };

  const updateMenuDish = (index: number, updates: Partial<MenuDish>) => {
    const updated = [...menuDishes];
    updated[index] = { ...updated[index]!, ...updates } as MenuDish;
    setMenuDishes(updated);
  };

  const getDishName = (dish: any) => {
    if (!dish) return "";
    return language === "vi" ? dish.name_vi : (dish.name_en ?? dish.name_vi);
  };

  const getMealGroupName = (group: string) => {
    return t(`meal.${group}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Group dishes by day and meal
  const dishesByDay = menuDishes.reduce(
    (acc, menuDish, index) => {
      const dayIndex = menuDish.day_index ?? -1;
      const mealGroup = menuDish.meal_group ?? "other";

      if (!acc[dayIndex]) {
        acc[dayIndex] = {};
      }
      if (!acc[dayIndex][mealGroup]) {
        acc[dayIndex][mealGroup] = [];
      }

      acc[dayIndex][mealGroup].push({ ...menuDish, index });
      return acc;
    },
    {} as Record<number, Record<string, (MenuDish & { index: number })[]>>,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("message.noData")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("action.back")}
          </Button>
          <h1 className="text-3xl font-bold">
            {t("action.edit")} {t("menu.name")}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={updateMenu.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateMenu.isPending ? t("message.loading") : t("action.save")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">{t("menu.details")}</TabsTrigger>
          <TabsTrigger value="weekly">{t("menu.weeklyView")}</TabsTrigger>
          <TabsTrigger value="list">{t("menu.listView")}</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{t("menu.basicInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("menu.name")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("menu.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">{t("menu.servings")}</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servings: parseInt(e.target.value) ?? 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("menu.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("menu.descriptionPlaceholder")}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="visibility">{t("menu.visibility")}</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        visibility: value as "private" | "public",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <EyeOff className="mr-2 h-4 w-4" />
                          {t("menu.visibility.private")}
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          {t("menu.visibility.public")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t("menu.startDate")}</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">{t("menu.endDate")}</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly View Tab */}
        <TabsContent value="weekly">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("menu.weeklyPlan")}</CardTitle>
                  <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("menu.addDish")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t("menu.addDish")}</DialogTitle>
                        <DialogDescription>
                          {t("menu.searchAndAddDishes")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Select
                            value={selectedDay?.toString() ?? "none"}
                            onValueChange={(v) =>
                              setSelectedDay(v === "none" ? null : parseInt(v))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("menu.selectDay")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                No specific day
                              </SelectItem>
                              {DAYS.map((day, index) => (
                                <SelectItem
                                  key={index}
                                  value={index.toString()}
                                >
                                  {language === "vi" ? DAYS_VI[index] : day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedMealGroup ?? "none"}
                            onValueChange={(v) =>
                              setSelectedMealGroup(v === "none" ? null : v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("menu.selectMeal")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                No specific meal
                              </SelectItem>
                              {MEAL_GROUPS.map((group) => (
                                <SelectItem key={group} value={group}>
                                  {getMealGroupName(group)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative">
                          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                          <Input
                            placeholder={t("menu.searchDishes")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        {searchResults && searchResults.dishes.length > 0 && (
                          <div className="max-h-96 space-y-2 overflow-y-auto">
                            {searchResults.dishes.map((dish) => (
                              <Card
                                key={dish.id}
                                className="cursor-pointer transition-shadow hover:shadow-sm"
                                onClick={() => addDishToMenu(dish)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium">
                                        {getDishName(dish)}
                                      </h4>
                                      <p className="text-muted-foreground line-clamp-1 text-sm">
                                        {language === "vi"
                                          ? dish.description_vi
                                          : (dish.description_en ??
                                            dish.description_vi)}
                                      </p>
                                      <div className="mt-2 flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {dish.cook_time} {t("time.minutes")}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          <span>{dish.servings}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button size="sm">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS.map((day, dayIndex) => {
                    const dayDishes = dishesByDay[dayIndex] ?? {};
                    const hasDishes = Object.values(dayDishes).some(
                      (dishes) => dishes.length > 0,
                    );

                    return (
                      <Card key={dayIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {language === "vi" ? DAYS_VI[dayIndex] : day}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {!hasDishes ? (
                            <p className="text-muted-foreground text-sm">
                              {t("menu.noDishesForDay")}
                            </p>
                          ) : (
                            <div className="grid gap-4 md:grid-cols-4">
                              {MEAL_GROUPS.map((mealGroup) => {
                                const dishes = dayDishes[mealGroup] ?? [];
                                if (dishes.length === 0) return null;

                                return (
                                  <div key={mealGroup}>
                                    <h4 className="text-muted-foreground mb-2 text-sm font-semibold">
                                      {getMealGroupName(mealGroup)}
                                    </h4>
                                    <div className="space-y-2">
                                      {dishes.map((menuDish) => (
                                        <Card
                                          key={menuDish.index}
                                          className="group"
                                        >
                                          <CardContent className="p-3">
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <p className="line-clamp-2 text-sm font-medium">
                                                  {getDishName(menuDish.dish)}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                  <Input
                                                    type="number"
                                                    min="1"
                                                    value={menuDish.quantity}
                                                    onChange={(e) =>
                                                      updateMenuDish(
                                                        menuDish.index,
                                                        {
                                                          quantity:
                                                            parseInt(
                                                              e.target.value,
                                                            ) ?? 1,
                                                        },
                                                      )
                                                    }
                                                    className="h-6 w-16 text-xs"
                                                  />
                                                  <span className="text-muted-foreground text-xs">
                                                    x
                                                  </span>
                                                </div>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  removeDishFromMenu(
                                                    menuDish.index,
                                                  )
                                                }
                                                className="opacity-0 transition-opacity group-hover:opacity-100"
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* List View Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("menu.allDishes")}</CardTitle>
                <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("menu.addDish")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t("menu.addDish")}</DialogTitle>
                      <DialogDescription>
                        {t("menu.searchAndAddDishes")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Select
                          value={selectedDay?.toString() ?? "none"}
                          onValueChange={(v) =>
                            setSelectedDay(v === "none" ? null : parseInt(v))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("menu.selectDay")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              No specific day
                            </SelectItem>
                            {DAYS.map((day, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {language === "vi" ? DAYS_VI[index] : day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedMealGroup ?? "none"}
                          onValueChange={(v) =>
                            setSelectedMealGroup(v === "none" ? null : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("menu.selectMeal")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              No specific meal
                            </SelectItem>
                            {MEAL_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {getMealGroupName(group)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                        <Input
                          placeholder={t("menu.searchDishes")}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      {searchResults && searchResults.dishes.length > 0 && (
                        <div className="max-h-96 space-y-2 overflow-y-auto">
                          {searchResults.dishes.map((dish) => (
                            <Card
                              key={dish.id}
                              className="cursor-pointer transition-shadow hover:shadow-sm"
                              onClick={() => addDishToMenu(dish)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {getDishName(dish)}
                                    </h4>
                                    <p className="text-muted-foreground line-clamp-1 text-sm">
                                      {language === "vi"
                                        ? dish.description_vi
                                        : (dish.description_en ??
                                          dish.description_vi)}
                                    </p>
                                    <div className="mt-2 flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {dish.cook_time} {t("time.minutes")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{dish.servings}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {menuDishes.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">{t("menu.noDishes")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dish.name")}</TableHead>
                      <TableHead>{t("meal.day")}</TableHead>
                      <TableHead>{t("meal.mealType")}</TableHead>
                      <TableHead>{t("ingredient.quantity")}</TableHead>
                      <TableHead className="text-right">
                        {t("dish.totalCost")}
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuDishes.map((menuDish, index) => {
                      const dishCost =
                        menuDish.dish?.DishIngredient?.reduce(
                          (sum: number, di: any) => {
                            const quantity =
                              typeof di.quantity === "object" &&
                              di.quantity?.toNumber
                                ? di.quantity.toNumber()
                                : Number(di.quantity);
                            const price =
                              typeof di.ingredient.current_price === "object" &&
                              di.ingredient.current_price?.toNumber
                                ? di.ingredient.current_price.toNumber()
                                : Number(di.ingredient.current_price);
                            return sum + quantity * price;
                          },
                          0,
                        ) * menuDish.quantity || 0;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">
                              {getDishName(menuDish.dish)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={menuDish.day_index?.toString() ?? "none"}
                              onValueChange={(v) =>
                                updateMenuDish(index, {
                                  day_index:
                                    v === "none" ? undefined : parseInt(v),
                                })
                              }
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-</SelectItem>
                                {DAYS.map((day, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {language === "vi" ? DAYS_VI[i] : day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={menuDish.meal_group ?? "none"}
                              onValueChange={(v) =>
                                updateMenuDish(index, {
                                  meal_group: v === "none" ? undefined : v,
                                })
                              }
                            >
                              <SelectTrigger className="h-8 w-[120px]">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-</SelectItem>
                                {MEAL_GROUPS.map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {getMealGroupName(group)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={menuDish.quantity}
                              onChange={(e) =>
                                updateMenuDish(index, {
                                  quantity: parseInt(e.target.value) ?? 1,
                                })
                              }
                              className="h-8 w-20"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(dishCost)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDishFromMenu(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
