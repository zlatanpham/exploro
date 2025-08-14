"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLanguage } from "../../_context/language";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import { normalizeVietnamese } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const INGREDIENT_CATEGORIES = [
  { value: "vegetables", label_vi: "Rau củ", label_en: "Vegetables" },
  { value: "meat", label_vi: "Thịt", label_en: "Meat" },
  { value: "seafood", label_vi: "Hải sản", label_en: "Seafood" },
  { value: "spices", label_vi: "Gia vị", label_en: "Spices" },
  { value: "dairy", label_vi: "Sữa", label_en: "Dairy" },
  { value: "grains", label_vi: "Ngũ cốc", label_en: "Grains" },
  { value: "fruits", label_vi: "Trái cây", label_en: "Fruits" },
  { value: "sauces", label_vi: "Nước chấm", label_en: "Sauces" },
  { value: "other", label_vi: "Khác", label_en: "Other" },
];

// Units are now loaded from database

// Helper function to safely convert Decimal to number
const toSafeNumber = (value: any): number => {
  if (typeof value === "number") return value;
  if (value && typeof value.toNumber === "function") return value.toNumber();
  return Number(value) || 0;
};

export default function IngredientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_vi: "",
    name_en: "",
    category: "",
    default_unit: "",
    unit_id: "",
    current_price: 0,
    density: null as number | null,
    seasonal_flag: false,
  });

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const { data: ingredients, refetch } = api.ingredient.getAll.useQuery();
  const { data: unitCategories } = api.unit.getAllGrouped.useQuery();
  const createIngredient = api.ingredient.create.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      setIsCreateOpen(false);
      resetForm();
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateIngredient = api.ingredient.update.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      setEditingIngredient(null);
      resetForm();
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteIngredient = api.ingredient.delete.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name_vi: "",
      name_en: "",
      category: "",
      default_unit: "",
      unit_id: "",
      current_price: 0,
      density: null,
      seasonal_flag: false,
    });
  };

  const handleCreate = () => {
    void createIngredient.mutate({
      ...formData,
      unit_id: formData.unit_id || undefined,
      density: formData.density ?? undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingIngredient) return;
    void updateIngredient.mutate({
      id: editingIngredient.id,
      data: {
        ...formData,
        unit_id: formData.unit_id || undefined,
        density: formData.density ?? undefined,
      },
    });
  };

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setFormData({
      name_vi: ingredient.name_vi,
      name_en: ingredient.name_en ?? "",
      category: ingredient.category,
      default_unit: ingredient.default_unit ?? "",
      unit_id: ingredient.unit_id ?? "",
      current_price: toSafeNumber(ingredient.current_price),
      density: ingredient.density ? toSafeNumber(ingredient.density) : null,
      seasonal_flag: ingredient.seasonal_flag,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t("message.confirmDelete"))) {
      void deleteIngredient.mutate({ id });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredIngredients = ingredients?.filter((ing) => {
    const normalizedQuery = normalizeVietnamese(searchQuery);
    const matchesSearch =
      normalizeVietnamese(ing.name_vi).includes(normalizedQuery) ||
      (ing.name_en &&
        normalizeVietnamese(ing.name_en).includes(normalizedQuery));
    const matchesCategory =
      selectedCategory === "all" || ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  // Don't render if not admin
  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("nav.ingredients")}</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("action.create")}
        </Button>
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
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("ingredient.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("message.all")}</SelectItem>
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === "vi" ? cat.label_vi : cat.label_en}
                  </SelectItem>
                ))}
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
                <TableHead>{t("ingredient.name")}</TableHead>
                <TableHead>{t("ingredient.category")}</TableHead>
                <TableHead>{t("ingredient.unit")}</TableHead>
                <TableHead>{t("ingredient.price")}</TableHead>
                <TableHead>{t("ingredient.seasonal")}</TableHead>
                <TableHead>{t("ingredient.lastUpdated")}</TableHead>
                <TableHead className="text-right">
                  {t("action.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredients?.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ingredient.name_vi}</div>
                      {ingredient.name_en && (
                        <div className="text-muted-foreground text-sm">
                          {ingredient.name_en}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {INGREDIENT_CATEGORIES.find(
                      (c) => c.value === ingredient.category,
                    )?.[language === "vi" ? "label_vi" : "label_en"] ??
                      ingredient.category}
                  </TableCell>
                  <TableCell>
                    {ingredient.unit?.symbol || ingredient.default_unit || "-"}
                  </TableCell>
                  <TableCell>
                    {formatPrice(toSafeNumber(ingredient.current_price))}
                  </TableCell>
                  <TableCell>
                    {ingredient.seasonal_flag ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(ingredient.price_updated_at).toLocaleDateString(
                      "vi-VN",
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ingredient.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingIngredient}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingIngredient(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? t("action.edit") : t("action.create")}{" "}
              {t("ingredient.name")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name_vi">
                {t("ingredient.name")} (Tiếng Việt) *
              </Label>
              <Input
                id="name_vi"
                value={formData.name_vi}
                onChange={(e) =>
                  setFormData({ ...formData, name_vi: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name_en">{t("ingredient.name")} (English)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">{t("ingredient.category")} *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === "vi" ? cat.label_vi : cat.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">{t("ingredient.unit")} *</Label>
              <Select
                value={formData.unit_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("ingredient.selectUnit")} />
                </SelectTrigger>
                <SelectContent>
                  {unitCategories?.map((category: any) => (
                    <div key={category.id}>
                      <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
                        {category.name.charAt(0).toUpperCase() +
                          category.name.slice(1)}
                      </div>
                      {category.units.map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.symbol} -{" "}
                          {language === "vi" ? unit.name_vi : unit.name_en}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Show density field for volume/mass units */}
            {formData.unit_id &&
              (() => {
                const selectedUnit = unitCategories
                  ?.flatMap((c: any) => c.units)
                  .find((u: any) => u.id === formData.unit_id);
                const unitCategory = unitCategories?.find(
                  (c: any) => c.id === selectedUnit?.category_id,
                );
                return (
                  unitCategory?.name === "volume" ||
                  unitCategory?.name === "mass"
                );
              })() && (
                <div className="grid gap-2">
                  <Label htmlFor="density">
                    {t("ingredient.density")} (g/ml)
                    <span className="text-muted-foreground ml-2 text-sm">
                      {t("ingredient.densityHint")}
                    </span>
                  </Label>
                  <Input
                    id="density"
                    type="number"
                    step="0.001"
                    value={formData.density || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        density: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              )}
            <div className="grid gap-2">
              <Label htmlFor="price">{t("ingredient.price")} (VND) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.current_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_price: parseFloat(e.target.value) ?? 0,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seasonal"
                checked={formData.seasonal_flag}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, seasonal_flag: !!checked })
                }
              />
              <Label htmlFor="seasonal" className="cursor-pointer">
                {t("ingredient.seasonal")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingIngredient(null);
                resetForm();
              }}
            >
              {t("action.cancel")}
            </Button>
            <Button
              onClick={editingIngredient ? handleUpdate : handleCreate}
              disabled={
                !formData.name_vi ||
                !formData.category ||
                !formData.unit_id ||
                formData.current_price <= 0
              }
            >
              {t("action.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
