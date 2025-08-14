"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useLanguage } from "../../_context/language";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  Users,
  Heart,
  DollarSign,
  ChefHat,
} from "lucide-react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { data: session } = useSession();

  const dishId = params.id as string;
  const { data: dish, isLoading } = api.dish.getById.useQuery({ id: dishId });
  const utils = api.useUtils();
  const { data: favorites } = api.dish.getFavorites.useQuery();

  const isFavorite = favorites?.some((f) => f.id === dishId) ?? false;

  const toggleFavorite = api.dish.toggleFavorite.useMutation({
    onMutate: async ({ dishId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.dish.getFavorites.cancel();

      // Snapshot the previous value
      const previousFavorites = utils.dish.getFavorites.getData();

      // Optimistically update the favorites
      const isFavorited = favorites?.some((f) => f.id === dishId) ?? false;

      if (isFavorited) {
        // Remove from favorites
        utils.dish.getFavorites.setData(undefined, (old) =>
          old?.filter((dish) => dish.id !== dishId),
        );
      } else {
        // Add to favorites - we need to find the dish data
        if (dish) {
          utils.dish.getFavorites.setData(undefined, (old) => [
            dish,
            ...(old || []),
          ]);
        }
      }

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorites) {
        utils.dish.getFavorites.setData(undefined, context.previousFavorites);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server state
      void utils.dish.getFavorites.invalidate();
    },
  });

  const handleToggleFavorite = () => {
    toggleFavorite.mutate({ dishId });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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

  const toNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseFloat(value);
    if (
      value &&
      typeof value === "object" &&
      typeof value.toNumber === "function"
    ) {
      return value.toNumber();
    }
    return Number(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="mb-6 aspect-video" />
            <Skeleton className="mb-4 h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("message.noData")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("action.back")}
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Dish Image */}
          <div className="relative mb-6 aspect-video overflow-hidden rounded-lg bg-gray-100">
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
                <ChefHat className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Dish Title and Description */}
          <div className="mb-6">
            <div className="mb-4 flex items-start justify-between">
              <h1 className="text-3xl font-bold">
                {language === "vi"
                  ? dish.name_vi
                  : (dish.name_en ?? dish.name_vi)}
              </h1>
              {session && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isFavorite ? t("action.unfavorite") : t("action.favorite")}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground mb-4 text-lg">
              {language === "vi"
                ? dish.description_vi
                : (dish.description_en ?? dish.description_vi)}
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {dish.DishTag.map((dishTag) => (
                <Badge key={dishTag.tag.id} variant="secondary">
                  {language === "vi"
                    ? dishTag.tag.name_vi
                    : (dishTag.tag.name_en ?? dishTag.tag.name_vi)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("dish.instructions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">
                {language === "vi"
                  ? dish.instructions_vi
                  : (dish.instructions_en ?? dish.instructions_vi)}
              </div>
            </CardContent>
          </Card>

          {/* Source */}
          {dish.source_url && (
            <div className="text-muted-foreground text-sm">
              Source:{" "}
              <a
                href={dish.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {new URL(dish.source_url).hostname}
              </a>
            </div>
          )}
        </div>

        <div>
          {/* Quick Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span>{t("dish.prepTime")}</span>
                </div>
                <span className="font-medium">
                  {formatCookTime(dish.prep_time)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span>{t("dish.cookTime")}</span>
                </div>
                <span className="font-medium">
                  {formatCookTime(dish.cook_time)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>{t("dish.servings")}</span>
                </div>
                <span className="font-medium">
                  {dish.servings} {t("time.people")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("dish.difficulty")}</span>
                <Badge className={getDifficultyColor(dish.difficulty)}>
                  {t(`dish.difficulty.${dish.difficulty}`)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <span>{t("dish.totalCost")}</span>
                </div>
                <span className="font-medium">
                  {formatPrice(dish.totalCost || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dish.ingredients")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ingredient.name")}</TableHead>
                    <TableHead className="text-right">
                      {t("ingredient.quantity")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dish.DishIngredient.map((di) => (
                    <TableRow key={di.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {language === "vi"
                              ? di.ingredient.name_vi
                              : (di.ingredient.name_en ??
                                di.ingredient.name_vi)}
                          </div>
                          {di.notes && (
                            <div className="text-muted-foreground text-xs">
                              {di.notes}
                            </div>
                          )}
                          {di.optional && (
                            <Badge variant="outline" className="text-xs">
                              Optional
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          {di.quantity.toString()}{" "}
                          {di.unit_ref?.symbol || di.unit}
                        </div>
                        {di.converted_quantity &&
                          di.unit_ref?.id !== di.ingredient.unit?.id && (
                            <div className="text-muted-foreground text-xs">
                              = {toNumber(di.converted_quantity).toFixed(3)}{" "}
                              {di.ingredient.unit?.symbol}
                            </div>
                          )}
                        <div className="text-muted-foreground mt-1 text-xs">
                          {formatPrice(
                            // Use converted quantity if available (this accounts for unit conversion)
                            // Otherwise fallback to original quantity
                            di.converted_quantity
                              ? toNumber(di.converted_quantity) *
                                  toNumber(di.ingredient.current_price)
                              : toNumber(di.quantity) *
                                  toNumber(di.ingredient.current_price),
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
