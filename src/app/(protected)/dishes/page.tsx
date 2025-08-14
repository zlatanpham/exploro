"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useLanguage } from "../_context/language";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Heart, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DishesPage() {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [maxCookTime, setMaxCookTime] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.dish.getAll.useInfiniteQuery(
      {
        search: searchQuery,
        difficulty: difficulty === "all" ? undefined : (difficulty as any),
        maxCookTime: maxCookTime === "all" ? undefined : parseInt(maxCookTime),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: 12,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const { data: tags } = api.tag.getAll.useQuery();
  const toggleFavorite = api.dish.toggleFavorite.useMutation();
  const { data: favorites } = api.dish.getFavorites.useQuery();

  const dishes = data?.pages.flatMap((page) => page.dishes) ?? [];
  // Deduplicate dishes by id to handle search variations that match the same dish
  const uniqueDishes = dishes.filter(
    (dish, index, self) => index === self.findIndex((d) => d.id === dish.id),
  );
  const favoriteIds = new Set(favorites?.map((f) => f.id) ?? []);

  const handleToggleFavorite = async (dishId: string) => {
    await toggleFavorite.mutateAsync({ dishId });
  };

  const formatCookTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} ${t("time.minutes")}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0
      ? `${hours} ${t("time.hours")} ${mins} ${t("time.minutes")}`
      : `${hours} ${t("time.hours")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">{t("nav.dishes")}</h1>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
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
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder={t("dish.difficulty")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("message.all")}</SelectItem>
                <SelectItem value="easy">
                  {t("dish.difficulty.easy")}
                </SelectItem>
                <SelectItem value="medium">
                  {t("dish.difficulty.medium")}
                </SelectItem>
                <SelectItem value="hard">
                  {t("dish.difficulty.hard")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={maxCookTime} onValueChange={setMaxCookTime}>
              <SelectTrigger>
                <SelectValue placeholder={t("dish.cookTime")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("message.all")}</SelectItem>
                <SelectItem value="30">≤ 30 {t("time.minutes")}</SelectItem>
                <SelectItem value="60">≤ 1 {t("time.hours")}</SelectItem>
                <SelectItem value="120">≤ 2 {t("time.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {tags && tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag.id)
                          ? prev.filter((id) => id !== tag.id)
                          : [...prev, tag.id],
                      );
                    }}
                  >
                    {language === "vi"
                      ? tag.name_vi
                      : (tag.name_en ?? tag.name_vi)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {uniqueDishes.map((dish) => (
          <Card
            key={dish.id}
            className="overflow-hidden transition-shadow hover:shadow-lg"
          >
            <Link href={`/dishes/${dish.id}`}>
              <div className="relative aspect-video bg-gray-100">
                {dish.image_url ? (
                  <Image
                    src={dish.image_url}
                    alt={
                      language === "vi"
                        ? dish.name_vi
                        : (dish.name_en ?? dish.name_vi)
                    }
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
            </Link>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2 text-lg">
                  {language === "vi"
                    ? dish.name_vi
                    : (dish.name_en ?? dish.name_vi)}
                </CardTitle>
                {session && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      void handleToggleFavorite(dish.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favoriteIds.has(dish.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {language === "vi"
                  ? dish.description_vi
                  : (dish.description_en ?? dish.description_vi)}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span>{formatCookTime(dish.cook_time)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>
                    {dish.servings} {t("time.people")}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={getDifficultyColor(dish.difficulty)}>
                  {t(`dish.difficulty.${dish.difficulty}`)}
                </Badge>
                {dish._count.FavoriteDish > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {dish._count.FavoriteDish} ❤️
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex flex-wrap gap-1">
                {dish.DishTag.slice(0, 3).map((dishTag) => (
                  <Badge
                    key={dishTag.tag.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {language === "vi"
                      ? dishTag.tag.name_vi
                      : (dishTag.tag.name_en ?? dishTag.tag.name_vi)}
                  </Badge>
                ))}
                {dish.DishTag.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dish.DishTag.length - 3}
                  </Badge>
                )}
              </div>
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
            {isFetchingNextPage ? t("message.loading") : "Load more"}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isFetchingNextPage && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {uniqueDishes.length === 0 && !isFetchingNextPage && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("message.noData")}</p>
        </div>
      )}
    </div>
  );
}
