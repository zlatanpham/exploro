"use client";

import { useSession } from "next-auth/react";
import { useLanguage } from "./_context/language";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Calendar, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();

  // Fetch some stats
  const { data: recentMenus } = api.menu.getUserMenus.useQuery({ limit: 3 });
  const { data: favorites } = api.dish.getFavorites.useQuery();
  const { data: publicDishes } = api.dish.getAll.useQuery({ limit: 6 });

  const user = session?.user as {
    name?: string;
    email?: string;
    role?: string;
  };

  return (
    <div className="container mx-auto space-y-6 px-6 pt-4 pb-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {language === "vi" ? "Xin chào" : "Welcome"}
          {user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          {language === "vi"
            ? "Hãy bắt đầu lập kế hoạch bữa ăn cho gia đình bạn"
            : "Start planning meals for your family"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/dishes">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("nav.dishes")}
              </CardTitle>
              <ChefHat className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {publicDishes?.dishes.length ?? 0}
              </div>
              <p className="text-muted-foreground text-xs">
                {language === "vi" ? "Món ăn có sẵn" : "Available dishes"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/menus">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("nav.menus")}
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentMenus?.menus.length ?? 0}
              </div>
              <p className="text-muted-foreground text-xs">
                {language === "vi" ? "Thực đơn của bạn" : "Your menus"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/favorites">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("nav.favorites")}
              </CardTitle>
              <Heart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites?.length ?? 0}</div>
              <p className="text-muted-foreground text-xs">
                {language === "vi" ? "Món yêu thích" : "Favorite dishes"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/menus?create=true">
          <Card className="bg-primary text-primary-foreground cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "vi" ? "Tạo thực đơn" : "Create Menu"}
              </CardTitle>
              <Plus className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-xs">
                {language === "vi"
                  ? "Bắt đầu lập kế hoạch bữa ăn mới"
                  : "Start planning a new meal"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Menus */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {language === "vi" ? "Thực đơn gần đây" : "Recent Menus"}
            </CardTitle>
            <Link href="/menus">
              <Button variant="ghost" size="sm">
                {language === "vi" ? "Xem tất cả" : "View all"}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentMenus && recentMenus.menus.length > 0 ? (
            <div className="space-y-4">
              {recentMenus.menus.map((menu) => (
                <div
                  key={menu.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Link
                      href={`/menus/${menu.id}`}
                      className="font-medium hover:underline"
                    >
                      {menu.name}
                    </Link>
                    <p className="text-muted-foreground text-sm">
                      {menu._count.MenuDish} {t("menu.dishes")} •{" "}
                      {menu.servings} {t("time.people")}
                    </p>
                  </div>
                  <Link href={`/menus/${menu.id}/edit`}>
                    <Button variant="outline" size="sm">
                      {t("action.edit")}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {language === "vi"
                ? "Bạn chưa có thực đơn nào. Hãy tạo thực đơn đầu tiên!"
                : "You don't have any menus yet. Create your first menu!"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Admin Quick Access */}
      {user?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("nav.admin")}</CardTitle>
            <CardDescription>
              {language === "vi" ? "Quản lý nội dung" : "Content management"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <Link href="/admin/dishes">
                <Button variant="outline" className="w-full">
                  {language === "vi" ? "Quản lý món ăn" : "Manage Dishes"}
                </Button>
              </Link>
              <Link href="/admin/ingredients">
                <Button variant="outline" className="w-full">
                  {language === "vi"
                    ? "Quản lý nguyên liệu"
                    : "Manage Ingredients"}
                </Button>
              </Link>
              <Link href="/admin/tags">
                <Button variant="outline" className="w-full">
                  {language === "vi" ? "Quản lý nhãn" : "Manage Tags"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
