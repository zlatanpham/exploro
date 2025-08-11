"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useLanguage } from "../../_context/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Edit,
  Share2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();

  const menuId = params.id as string;
  const { data: menu, isLoading } = api.menu.getById.useQuery({ id: menuId });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateRange = (start?: Date | null, end?: Date | null) => {
    if (!start && !end) return t("menu.noDateSet");
    const format = (date: Date) =>
      new Date(date).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US");
    if (start && end) return `${format(start)} - ${format(end)}`;
    if (start) return `From ${format(start)}`;
    if (end) return `Until ${format(end)}`;
  };

  const getMealGroupName = (group: string) => {
    return t(`meal.${group}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-6 h-64 w-full" />
        <Skeleton className="h-96 w-full" />
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

  // Group dishes by day and meal
  const dishesByDay = menu.MenuDish.reduce(
    (acc, menuDish) => {
      const dayIndex = menuDish.day_index ?? -1;
      const mealGroup = menuDish.meal_group ?? "other";

      if (!acc[dayIndex]) {
        acc[dayIndex] = {};
      }
      if (!acc[dayIndex][mealGroup]) {
        acc[dayIndex][mealGroup] = [];
      }

      acc[dayIndex][mealGroup].push(menuDish);
      return acc;
    },
    {} as Record<number, Record<string, typeof menu.MenuDish>>,
  );

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("action.back")}
      </Button>

      {/* Menu Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{menu.name}</h1>
            {menu.description && (
              <p className="text-muted-foreground text-lg">
                {menu.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={menu.visibility === "public" ? "default" : "secondary"}
            >
              {menu.visibility === "public" ? (
                <Eye className="mr-1 h-3 w-3" />
              ) : (
                <EyeOff className="mr-1 h-3 w-3" />
              )}
              {t(`menu.visibility.${menu.visibility}`)}
            </Badge>
            <Link href={`/menus/${menu.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                {t("action.edit")}
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              {t("action.share")}
            </Button>
          </div>
        </div>

        {/* Menu Info */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {t("menu.dateRange")}
              </div>
              <p className="font-medium">
                {formatDateRange(menu.start_date, menu.end_date)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                {t("menu.servings")}
              </div>
              <p className="font-medium">
                {menu.servings} {t("time.people")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4" />
                {t("menu.totalCost")}
              </div>
              <p className="font-medium">{formatPrice(menu.totalCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4" />
                {t("menu.costPerPerson")}
              </div>
              <p className="font-medium">{formatPrice(menu.costPerPerson)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList>
          <TabsTrigger value="weekly">{t("menu.weeklyView")}</TabsTrigger>
          <TabsTrigger value="list">{t("menu.listView")}</TabsTrigger>
          <TabsTrigger value="shopping">{t("menu.shoppingList")}</TabsTrigger>
        </TabsList>

        {/* Weekly View */}
        <TabsContent value="weekly">
          <div className="grid gap-4">
            {DAYS.map((day, dayIndex) => {
              const dayDishes = dishesByDay[dayIndex] ?? {};
              const hasDishes = Object.values(dayDishes).some(
                (dishes) => dishes.length > 0,
              );

              if (!hasDishes) return null;

              return (
                <Card key={dayIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === "vi" ? DAYS_VI[dayIndex] : day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                                <Link
                                  key={menuDish.id}
                                  href={`/dishes/${menuDish.dish.id}`}
                                  className="block"
                                >
                                  <Card className="cursor-pointer transition-shadow hover:shadow-sm">
                                    <CardContent className="p-3">
                                      <p className="line-clamp-2 text-sm font-medium">
                                        {language === "vi"
                                          ? menuDish.dish.name_vi
                                          : (menuDish.dish.name_en ??
                                            menuDish.dish.name_vi)}
                                      </p>
                                      {menuDish.quantity > 1 && (
                                        <p className="text-muted-foreground text-xs">
                                          x{menuDish.quantity}
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menu.MenuDish.map((menuDish) => {
                    const dishCost =
                      menuDish.dish.DishIngredient.reduce((sum, di) => {
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
                      }, 0) * menuDish.quantity;

                    return (
                      <TableRow key={menuDish.id}>
                        <TableCell>
                          <Link
                            href={`/dishes/${menuDish.dish.id}`}
                            className="hover:underline"
                          >
                            <div>
                              <div className="font-medium">
                                {language === "vi"
                                  ? menuDish.dish.name_vi
                                  : (menuDish.dish.name_en ??
                                    menuDish.dish.name_vi)}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {language === "vi"
                                  ? menuDish.dish.description_vi
                                  : (menuDish.dish.description_en ??
                                    menuDish.dish.description_vi)}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          {menuDish.day_index !== null
                            ? language === "vi"
                              ? DAYS_VI[menuDish.day_index]
                              : DAYS[menuDish.day_index]
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {menuDish.meal_group
                            ? getMealGroupName(menuDish.meal_group)
                            : "-"}
                        </TableCell>
                        <TableCell>x{menuDish.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(dishCost)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopping List */}
        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("menu.shoppingList")}</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t("action.download")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ingredient.name")}</TableHead>
                    <TableHead>{t("ingredient.quantity")}</TableHead>
                    <TableHead>{t("ingredient.price")}</TableHead>
                    <TableHead className="text-right">
                      {t("dish.totalCost")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menu.aggregatedIngredients.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {language === "vi"
                              ? item.ingredient.name_vi
                              : (item.ingredient.name_en ??
                                item.ingredient.name_vi)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {t("menu.usedIn")}: {item.dishes.join(", ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.totalQuantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        {formatPrice(
                          typeof item.ingredient.current_price === "object" &&
                            item.ingredient.current_price?.toNumber
                            ? item.ingredient.current_price.toNumber()
                            : Number(item.ingredient.current_price),
                        )}
                        /{item.ingredient.default_unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(
                          item.totalQuantity *
                            (typeof item.ingredient.current_price ===
                              "object" &&
                            item.ingredient.current_price?.toNumber
                              ? item.ingredient.current_price.toNumber()
                              : Number(item.ingredient.current_price)),
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
