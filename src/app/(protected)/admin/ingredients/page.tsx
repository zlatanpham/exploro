"use client";

import React, { useState, useEffect } from "react";
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
import {
  Trash2,
  Edit,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Minus,
} from "lucide-react";
import { normalizeVietnamese } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
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
  
  // Unit mappings state
  const [unitMappings, setUnitMappings] = useState<Array<{
    id?: string;
    countUnitId: string;
    measurableUnitId: string;
    quantity: number;
  }>>([]);
  const [showMappings, setShowMappings] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const { data: ingredients, refetch } = api.ingredient.getAll.useQuery();
  const { data: unitCategories } = api.unit.getAllGrouped.useQuery();
  const { data: allUnits } = api.unit.getAll.useQuery();
  
  // Ingredient mappings query - only when editing
  const { data: existingMappings } = api.ingredientUnitMapping.getByIngredient.useQuery(
    { ingredientId: editingIngredient?.id ?? "" },
    { enabled: !!editingIngredient?.id }
  );
  const createIngredient = api.ingredient.create.useMutation({
    onSuccess: async (newIngredient) => {
      // Save unit mappings for the new ingredient
      await saveMappings(newIngredient.id);
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
    onSuccess: async () => {
      if (editingIngredient) {
        // Save unit mappings for the updated ingredient
        await saveMappings(editingIngredient.id);
      }
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

  // Unit mapping mutations
  const createMapping = api.ingredientUnitMapping.upsert.useMutation();
  const deleteMapping = api.ingredientUnitMapping.delete.useMutation();

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
    setUnitMappings([]);
    setShowMappings(false);
  };

  // Load existing mappings when editing an ingredient
  React.useEffect(() => {
    if (existingMappings) {
      const mappings = existingMappings.map((mapping: any) => ({
        id: mapping.id,
        countUnitId: mapping.count_unit_id,
        measurableUnitId: mapping.measurable_unit_id,
        quantity: parseFloat(mapping.quantity.toString()),
      }));
      setUnitMappings(mappings);
      setShowMappings(mappings.length > 0);
    }
  }, [existingMappings]);

  // Save mappings for an ingredient
  const saveMappings = async (ingredientId: string) => {
    for (const mapping of unitMappings) {
      try {
        await createMapping.mutateAsync({
          ingredientId,
          countUnitId: mapping.countUnitId,
          measurableUnitId: mapping.measurableUnitId,
          quantity: mapping.quantity,
        });
      } catch (error) {
        console.error("Error saving mapping:", error);
      }
    }
  };

  // Add a new mapping
  const addMapping = () => {
    setUnitMappings([
      ...unitMappings,
      {
        countUnitId: "",
        measurableUnitId: "",
        quantity: 1,
      },
    ]);
  };

  // Remove a mapping
  const removeMapping = async (index: number) => {
    const mapping = unitMappings[index];
    if (mapping?.id && editingIngredient) {
      // Delete from server if it exists
      try {
        await deleteMapping.mutateAsync({
          ingredientId: editingIngredient.id,
          countUnitId: mapping.countUnitId,
        });
      } catch (error) {
        console.error("Error deleting mapping:", error);
      }
    }
    // Remove from local state
    setUnitMappings(unitMappings.filter((_, i) => i !== index));
  };

  // Update a mapping
  const updateMapping = (index: number, field: string, value: any) => {
    const newMappings = [...unitMappings];
    (newMappings[index] as any)[field] = value;
    setUnitMappings(newMappings);
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
    setShowMappings(false); // Will be set to true if mappings exist when data loads
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

  // Pagination calculations
  const totalItems = filteredIngredients?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIngredients = filteredIngredients?.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // Update pagination when search or category changes
  React.useEffect(() => {
    resetToFirstPage();
  }, [searchQuery, selectedCategory]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="container mx-auto pt-4 pb-6">Loading...</div>;
  }

  // Don't render if not admin
  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto pt-4 pb-6">
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
              {paginatedIngredients?.map((ingredient) => (
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
                    <Badge variant="secondary" className="text-xs">
                      {INGREDIENT_CATEGORIES.find(
                        (c) => c.value === ingredient.category,
                      )?.[language === "vi" ? "label_vi" : "label_en"] ??
                        ingredient.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ingredient.unit?.symbol ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-muted rounded px-2 py-1 font-mono text-sm">
                          {ingredient.unit.symbol}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {language === "vi"
                            ? ingredient.unit.name_vi
                            : ingredient.unit.name_en}
                        </span>
                      </div>
                    ) : ingredient.default_unit ? (
                      <span className="bg-muted rounded px-2 py-1 font-mono text-sm">
                        {ingredient.default_unit}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatPrice(toSafeNumber(ingredient.current_price))}
                    </span>
                  </TableCell>
                  <TableCell>
                    {ingredient.seasonal_flag ? (
                      <Badge
                        variant="outline"
                        className="border-green-300 bg-green-50 text-green-700"
                      >
                        Seasonal
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
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

      {/* Pagination and Results Summary */}
      {filteredIngredients && filteredIngredients.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} ingredients
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {/* Add ellipsis if there's a gap */}
                      {index > 0 && (array[index - 1] ?? 0) < page - 1 && (
                        <span className="text-muted-foreground px-2">...</span>
                      )}

                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {filteredIngredients && filteredIngredients.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-muted-foreground text-center">
              <Search className="mx-auto mb-4 h-8 w-8 opacity-50" />
              <p className="mb-2 text-lg">No ingredients found</p>
              <p className="text-sm">
                Try adjusting your search criteria or category filter
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? t("action.edit") : t("action.create")}{" "}
              {t("ingredient.name")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto flex-1">
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

            {/* Unit Mappings Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-semibold text-gray-900">
                    {t("admin.ingredientMappings")}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("admin.ingredientMappingsDescription")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMappings(!showMappings)}
                  className="min-w-[120px]"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {showMappings ? t("action.hide") : t("action.show")}
                </Button>
              </div>
              
              {showMappings && (
                <div className="space-y-4">
                  {unitMappings.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <ArrowLeftRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">{t("admin.noMappings")}</p>
                      <p className="text-sm text-gray-400 mt-1">{t("admin.noMappingsDescription")}</p>
                    </div>
                  )}
                  
                  {unitMappings.map((mapping, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm">
                      {/* Single row layout with all fields horizontally aligned */}
                      <div className="flex items-end gap-2">
                        {/* Count unit select */}
                        <div className="flex-1 min-w-0">
                          <Label className="text-xs font-medium text-gray-600 mb-1 block">
                            {t("unit.countUnit")}
                          </Label>
                          <Select
                            value={mapping.countUnitId}
                            onValueChange={(value) => updateMapping(index, "countUnitId", value)}
                          >
                            <SelectTrigger className="h-8 bg-white text-sm">
                              <SelectValue placeholder={t("action.selectCountUnit")} />
                            </SelectTrigger>
                            <SelectContent className="max-w-xs">
                              {allUnits?.filter((unit: any) => unit.category.name === "count").map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id} className="text-sm">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-medium text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                      {unit.symbol}
                                    </span>
                                    <span className="text-xs truncate max-w-[120px]" title={unit.name_vi}>
                                      {unit.name_vi}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Equals sign */}
                        <div className="text-sm font-medium text-gray-500 px-1 flex-shrink-0 pb-1">=</div>
                        
                        {/* Quantity input */}
                        <div className="w-20 flex-shrink-0">
                          <Label className="text-xs font-medium text-gray-600 mb-1 block">
                            {t("common.quantity")}
                          </Label>
                          <Input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={mapping.quantity}
                            onChange={(e) => updateMapping(index, "quantity", parseFloat(e.target.value) || 1)}
                            className="h-8 bg-white text-center text-sm font-medium"
                            placeholder="1"
                          />
                        </div>
                        
                        {/* Measurable unit select */}
                        <div className="flex-1 min-w-0">
                          <Label className="text-xs font-medium text-gray-600 mb-1 block">
                            {t("unit.measurableUnit")}
                          </Label>
                          <Select
                            value={mapping.measurableUnitId}
                            onValueChange={(value) => updateMapping(index, "measurableUnitId", value)}
                          >
                            <SelectTrigger className="h-8 bg-white text-sm">
                              <SelectValue placeholder={t("action.selectUnit")} />
                            </SelectTrigger>
                            <SelectContent className="max-w-xs">
                              {allUnits?.filter((unit: any) => ["mass", "volume"].includes(unit.category.name)).map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id} className="text-sm">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-medium text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                      {unit.symbol}
                                    </span>
                                    <span className="text-xs truncate max-w-[120px]" title={unit.name_vi}>
                                      {unit.name_vi}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Delete button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMapping(index)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors flex-shrink-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Compact preview */}
                      {mapping.countUnitId && mapping.measurableUnitId && mapping.quantity && (
                        <div className="bg-gray-100 border border-gray-300 rounded px-2 py-1.5 mt-2">
                          <div className="text-xs text-gray-700 font-medium text-center">
                            1 {allUnits?.find((u: any) => u.id === mapping.countUnitId)?.symbol || "unit"}
                            <span className="mx-1">=</span>
                            {mapping.quantity} {allUnits?.find((u: any) => u.id === mapping.measurableUnitId)?.symbol || "unit"}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMapping}
                      className="w-full h-10 bg-white hover:bg-gray-50 border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 transition-all text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("action.addMapping")}
                    </Button>
                  </div>
                </div>
              )}
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
