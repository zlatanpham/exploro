"use client";

import { api } from "@/trpc/react";
import { useLanguage } from "../_context/language";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { t, language } = useLanguage();
  const utils = api.useUtils();
  const { data: favorites } = api.dish.getFavorites.useQuery();

  const toggleFavorite = api.dish.toggleFavorite.useMutation({
    onMutate: async ({ dishId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.dish.getFavorites.cancel();

      // Snapshot the previous value
      const previousFavorites = utils.dish.getFavorites.getData();

      // Optimistically remove from favorites
      utils.dish.getFavorites.setData(undefined, (old) =>
        old?.filter((dish) => dish.id !== dishId),
      );

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onSuccess: () => {
      toast.success(t("message.success"));
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

  const handleRemoveFavorite = (dishId: string) => {
    toggleFavorite.mutate({ dishId });
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
    <div className="container mx-auto pt-4 pb-6">
      <h1 className="mb-6 text-3xl font-bold">{t("nav.favorites")}</h1>

      {favorites && favorites.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((dish) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFavorite(dish.id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
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
                <div className="mt-2">
                  <Badge className={getDifficultyColor(dish.difficulty)}>
                    {t(`dish.difficulty.${dish.difficulty}`)}
                  </Badge>
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
      ) : (
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-muted-foreground mb-4">{t("favorites.empty")}</p>
          <Link href="/dishes">
            <Button>{t("favorites.browseDishes")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
