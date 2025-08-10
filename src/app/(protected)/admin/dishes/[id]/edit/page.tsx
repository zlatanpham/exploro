"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../../../_context/language";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DishIngredient {
  ingredient_id: string;
  quantity: number;
  unit: string; // Legacy field
  unit_id?: string; // New unit reference
  notes?: string;
  optional?: boolean;
}

export default function EditDishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  // Form state
  const [name_vi, setNameVi] = useState("");
  const [name_en, setNameEn] = useState("");
  const [description_vi, setDescriptionVi] = useState("");
  const [description_en, setDescriptionEn] = useState("");
  const [instructions_vi, setInstructionsVi] = useState("");
  const [instructions_en, setInstructionsEn] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [cook_time, setCookTime] = useState(30);
  const [prep_time, setPrepTime] = useState(15);
  const [servings, setServings] = useState(4);
  const [image_url, setImageUrl] = useState("");
  const [source_url, setSourceUrl] = useState("");
  const [dishStatus, setDishStatus] = useState<"active" | "inactive">("active");
  const [ingredients, setIngredients] = useState<DishIngredient[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch dish data
  const { data: dish, isLoading: dishLoading } = api.dish.getById.useQuery(
    { id: resolvedParams.id },
    { enabled: !!resolvedParams.id },
  );

  // Fetch all ingredients (for dropdown)
  const { data: allIngredients } = api.ingredient.getAll.useQuery(undefined, {
    enabled: status === "authenticated" && session?.user?.role === "admin",
  });
  
  // Fetch all unit categories
  const { data: unitCategories } = api.unit.getAllGrouped.useQuery(undefined, {
    enabled: status === "authenticated" && session?.user?.role === "admin",
  });

  // Fetch all tags
  const { data: allTags } = api.tag.getAll.useQuery();

  // Update mutation
  const updateDish = api.dish.update.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      router.push("/admin/dishes");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Populate form when dish data is loaded
  useEffect(() => {
    if (dish) {
      setNameVi(dish.name_vi);
      setNameEn(dish.name_en ?? "");
      setDescriptionVi(dish.description_vi);
      setDescriptionEn(dish.description_en ?? "");
      setInstructionsVi(dish.instructions_vi);
      setInstructionsEn(dish.instructions_en ?? "");
      setDifficulty(dish.difficulty as "easy" | "medium" | "hard");
      setCookTime(dish.cook_time);
      setPrepTime(dish.prep_time ?? 15);
      setServings(dish.servings);
      setImageUrl(dish.image_url ?? "");
      setSourceUrl(dish.source_url ?? "");
      setDishStatus(dish.status as "active" | "inactive");

      // Map dish ingredients
      setIngredients(
        dish.DishIngredient.map((di) => ({
          ingredient_id: di.ingredient_id,
          quantity:
            typeof di.quantity === "object" && di.quantity.toNumber
              ? di.quantity.toNumber()
              : Number(di.quantity),
          unit: di.unit || "",
          unit_id: di.unit_id || "",
          notes: di.notes ?? undefined,
          optional: di.optional ?? false,
        })),
      );

      // Map selected tags
      setSelectedTags(dish.DishTag.map((dt) => dt.tag_id));
    }
  }, [dish]);

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading" || dishLoading) {
    return <div className="container mx-auto py-6">{t("message.loading")}</div>;
  }

  // Don't render if not admin
  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateDish.mutate({
      id: resolvedParams.id,
      dish: {
        name_vi,
        name_en: name_en || undefined,
        description_vi,
        description_en: description_en || undefined,
        instructions_vi,
        instructions_en: instructions_en || undefined,
        difficulty,
        cook_time,
        prep_time: prep_time || undefined,
        servings,
        image_url: image_url || undefined,
        source_url: source_url || undefined,
        status: dishStatus,
      },
      ingredients,
      tags: selectedTags,
    });
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        ingredient_id: "",
        quantity: 1,
        unit: "",
        unit_id: "",
        optional: false,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof DishIngredient,
    value: any,
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value } as DishIngredient;
    setIngredients(updated);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dishes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {t("action.edit")} {t("nav.dishes")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("message.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_vi">{t("dish.name")} (VI) *</Label>
                <Input
                  id="name_vi"
                  value={name_vi}
                  onChange={(e) => setNameVi(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">{t("dish.name")} (EN)</Label>
                <Input
                  id="name_en"
                  value={name_en}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description_vi">
                  {t("dish.description")} (VI) *
                </Label>
                <Textarea
                  id="description_vi"
                  value={description_vi}
                  onChange={(e) => setDescriptionVi(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="description_en">
                  {t("dish.description")} (EN)
                </Label>
                <Textarea
                  id="description_en"
                  value={description_en}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">{t("dish.difficulty")} *</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={dishStatus}
                  onValueChange={(v) => setDishStatus(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="servings">{t("dish.servings")} *</Label>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  value={prep_time}
                  onChange={(e) => setPrepTime(parseInt(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="cook_time">
                  {t("dish.cookTime")} (minutes) *
                </Label>
                <Input
                  id="cook_time"
                  type="number"
                  value={cook_time}
                  onChange={(e) => setCookTime(parseInt(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={image_url}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="source_url">Source URL</Label>
                <Input
                  id="source_url"
                  type="url"
                  value={source_url}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dish.instructions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instructions_vi">
                {t("dish.instructions")} (VI) *
              </Label>
              <Textarea
                id="instructions_vi"
                value={instructions_vi}
                onChange={(e) => setInstructionsVi(e.target.value)}
                required
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="instructions_en">
                {t("dish.instructions")} (EN)
              </Label>
              <Textarea
                id="instructions_en"
                value={instructions_en}
                onChange={(e) => setInstructionsEn(e.target.value)}
                rows={6}
              />
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
                  <TableHead>{t("ingredient.quantity")}</TableHead>
                  <TableHead>{t("ingredient.unit")}</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={ingredient.ingredient_id}
                        onValueChange={(v) => {
                          updateIngredient(index, "ingredient_id", v);
                          // Auto-select default unit when ingredient is selected
                          const selectedIng = allIngredients?.find((ing) => ing.id === v);
                          if (selectedIng?.unit) {
                            updateIngredient(index, "unit_id", selectedIng.unit.id);
                            updateIngredient(index, "unit", selectedIng.unit.symbol);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("action.select")} />
                        </SelectTrigger>
                        <SelectContent>
                          {allIngredients?.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {language === "vi"
                                ? ing.name_vi
                                : (ing.name_en ?? ing.name_vi)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "quantity",
                            parseFloat(e.target.value),
                          )
                        }
                        min={0}
                        step={0.1}
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const selectedIngredient = allIngredients?.find(
                          (ing) => ing.id === ingredient.ingredient_id
                        );
                        const ingredientUnit = selectedIngredient?.unit;
                        const compatibleUnits = ingredientUnit
                          ? unitCategories
                              ?.find((cat: any) => cat.id === ingredientUnit.category_id)
                              ?.units || []
                          : [];

                        return (
                          <Select
                            value={ingredient.unit_id || ""}
                            onValueChange={(v) => {
                              updateIngredient(index, "unit_id", v);
                              // Also update legacy unit field with symbol
                              const unit = compatibleUnits.find((u: any) => u.id === v);
                              if (unit) {
                                updateIngredient(index, "unit", unit.symbol);
                              }
                            }}
                            disabled={!ingredient.ingredient_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("action.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              {compatibleUnits.map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.symbol} - {language === "vi" ? unit.name_vi : unit.name_en}
                                  {ingredientUnit?.id === unit.id && " (default)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={ingredient.notes ?? ""}
                        onChange={(e) =>
                          updateIngredient(index, "notes", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={ingredient.optional}
                        onCheckedChange={(checked) =>
                          updateIngredient(index, "optional", checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("action.add")} {t("ingredient.name")}
            </Button>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTags?.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <Checkbox
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTags([...selectedTags, tag.id]);
                      } else {
                        setSelectedTags(
                          selectedTags.filter((t) => t !== tag.id),
                        );
                      }
                    }}
                  />
                  <span className="text-sm">
                    {language === "vi"
                      ? tag.name_vi
                      : (tag.name_en ?? tag.name_vi)}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/dishes">
            <Button type="button" variant="outline">
              {t("action.cancel")}
            </Button>
          </Link>
          <Button type="submit" disabled={updateDish.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateDish.isPending ? t("message.loading") : t("action.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
