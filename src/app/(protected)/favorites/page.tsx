"use client";

import { api } from "@/trpc/react";
import { useLanguage } from "../_context/language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { t, language } = useLanguage();
  const { data: favorites, refetch } = api.dish.getFavorites.useQuery();
  const toggleFavorite = api.dish.toggleFavorite.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success(t("message.success"));
    },
  });

  const handleRemoveFavorite = async (dishId: string) => {
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
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{t("nav.favorites")}</h1>

      {favorites && favorites.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((dish) => (
            <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/dishes/${dish.id}`}>
                <div className="aspect-video relative bg-gray-100">
                  {dish.image_url ? (
                    <Image
                      src={dish.image_url}
                      alt={language === "vi" ? dish.name_vi : dish.name_en ?? dish.name_vi}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {language === "vi" ? dish.name_vi : dish.name_en ?? dish.name_vi}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      void handleRemoveFavorite(dish.id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {language === "vi" ? dish.description_vi : dish.description_en ?? dish.description_vi}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatCookTime(dish.cook_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{dish.servings} {t("time.people")}</span>
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
                    <Badge key={dishTag.tag.id} variant="secondary" className="text-xs">
                      {language === "vi" ? dishTag.tag.name_vi : dishTag.tag.name_en ?? dishTag.tag.name_vi}
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
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t("favorites.empty")}</p>
          <Link href="/dishes">
            <Button>{t("favorites.browseDishes")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}