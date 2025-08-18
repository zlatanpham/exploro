"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useLanguage } from "../_context/language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Users, Eye, EyeOff, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MenusPage() {
  const { t, language } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    servings: 4,
    visibility: "private",
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    api.menu.getUserMenus.useInfiniteQuery(
      {
        limit: 12,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const createMenu = api.menu.create.useMutation({
    onSuccess: (menu) => {
      toast.success(t("message.success"));
      setIsCreateOpen(false);
      resetForm();
      void refetch();
      // Navigate to menu builder
      window.location.href = `/menus/${menu.id}/edit`;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMenu = api.menu.delete.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const menus = data?.pages.flatMap((page) => page.menus) ?? [];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      servings: 4,
      visibility: "private",
    });
  };

  const handleCreate = () => {
    void createMenu.mutate({
      menu: {
        name: formData.name,
        description: formData.description ?? undefined,
        servings: formData.servings,
        visibility: formData.visibility as any,
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${t("message.confirmDelete")} "${name}"?`)) {
      void deleteMenu.mutate({ id });
    }
  };

  const formatDateRange = (start?: Date | null, end?: Date | null) => {
    if (!start && !end) return t("menu.noDateSet");
    const format = (date: Date) =>
      date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US");
    if (start && end) return `${format(start)} - ${format(end)}`;
    if (start) return `From ${format(start)}`;
    if (end) return `Until ${format(end)}`;
  };

  return (
    <div className="container mx-auto pt-4 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("nav.menus")}</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("action.create")}
        </Button>
      </div>

      {/* Public Menus Link */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 font-semibold">{t("menu.browsePublic")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("menu.browsePublicDescription")}
              </p>
            </div>
            <Link href="/menus/public">
              <Button variant="outline">{t("action.browse")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* User's Menus */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <Card key={menu.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1 text-lg">
                    {menu.name}
                  </CardTitle>
                  {menu.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {menu.description}
                    </CardDescription>
                  )}
                </div>
                <Badge
                  variant={
                    menu.visibility === "public" ? "default" : "secondary"
                  }
                >
                  {menu.visibility === "public" ? (
                    <Eye className="mr-1 h-3 w-3" />
                  ) : (
                    <EyeOff className="mr-1 h-3 w-3" />
                  )}
                  {t(`menu.visibility.${menu.visibility}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>{formatDateRange(menu.start_date, menu.end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>
                    {menu.servings} {t("time.people")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {menu._count.MenuDish} {t("menu.dishes")}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href={`/menus/${menu.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  {t("action.view")}
                </Button>
              </Link>
              <Link href={`/menus/${menu.id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full">
                  {t("action.edit")}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(menu.id, menu.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="mt-8 text-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? t("message.loading") : t("action.loadMore")}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isFetchingNextPage && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {menus.length === 0 && !isFetchingNextPage && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">{t("menu.noMenus")}</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("menu.createFirst")}
          </Button>
        </div>
      )}

      {/* Create Menu Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("action.create")} {t("menu.name")}
            </DialogTitle>
            <DialogDescription>{t("menu.createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="description">{t("menu.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("menu.descriptionPlaceholder")}
              />
            </div>
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="visibility">{t("menu.visibility")}</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) =>
                  setFormData({ ...formData, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    {t("menu.visibility.private")}
                  </SelectItem>
                  <SelectItem value="public">
                    {t("menu.visibility.public")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
            >
              {t("action.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || createMenu.isPending}
            >
              {createMenu.isPending ? t("message.loading") : t("action.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
