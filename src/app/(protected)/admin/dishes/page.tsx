"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../_context/language";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDishesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // All hooks must be called before any conditional returns
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    api.dish.getAll.useInfiniteQuery(
      {
        search: searchQuery,
        status: statusFilter as any,
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: status === "authenticated" && session?.user?.role === "admin",
      },
    );

  const deleteDish = api.dish.delete.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="container mx-auto pt-4 pb-6">{t("message.loading")}</div>
    );
  }

  // Don't render if not admin
  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  const dishes = data?.pages.flatMap((page) => page.dishes) ?? [];

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${t("message.confirmDelete")} "${name}"?`)) {
      void deleteDish.mutate({ id });
    }
  };

  const formatCookTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[difficulty as keyof typeof colors]}>
        {t(`dish.difficulty.${difficulty}`)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto pt-4 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t("nav.admin")} - {t("nav.dishes")}
        </h1>
        <Link href="/admin/dishes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("action.create")}
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder={t("action.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("message.all")}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dish.name")}</TableHead>
                <TableHead>{t("dish.difficulty")}</TableHead>
                <TableHead>{t("dish.cookTime")}</TableHead>
                <TableHead>{t("dish.servings")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">
                  {t("action.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow key={dish.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dish.name_vi}</div>
                      {dish.name_en && (
                        <div className="text-muted-foreground text-sm">
                          {dish.name_en}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(dish.difficulty)}</TableCell>
                  <TableCell>{formatCookTime(dish.cook_time)}</TableCell>
                  <TableCell>{dish.servings}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        dish.status === "active" ? "default" : "secondary"
                      }
                    >
                      {dish.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dish.DishTag.slice(0, 2).map((dt) => (
                        <Badge
                          key={dt.tag.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {language === "vi"
                            ? dt.tag.name_vi
                            : (dt.tag.name_en ?? dt.tag.name_vi)}
                        </Badge>
                      ))}
                      {dish.DishTag.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{dish.DishTag.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/dishes/${dish.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(dish.id, dish.name_vi)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Load More */}
      {hasNextPage && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? t("message.loading") : "Load more"}
          </Button>
        </div>
      )}

      {/* No Results */}
      {dishes.length === 0 && !isFetchingNextPage && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("message.noData")}</p>
        </div>
      )}
    </div>
  );
}
