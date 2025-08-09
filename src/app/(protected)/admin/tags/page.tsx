"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TAG_CATEGORIES = [
  { value: "meal_type", label_vi: "Loại bữa ăn", label_en: "Meal Type" },
  { value: "cuisine", label_vi: "Ẩm thực", label_en: "Cuisine" },
  { value: "dietary", label_vi: "Chế độ ăn", label_en: "Dietary" },
  { value: "season", label_vi: "Mùa", label_en: "Season" },
  { value: "occasion", label_vi: "Dịp lễ", label_en: "Occasion" },
  { value: "cooking_method", label_vi: "Phương pháp nấu", label_en: "Cooking Method" },
  { value: "other", label_vi: "Khác", label_en: "Other" },
];

export default function TagsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_vi: "",
    name_en: "",
    category: "",
  });

  // Check if user is admin
  if (session?.user?.role !== "admin") {
    router.push("/");
    return null;
  }

  const { data: tags, refetch } = api.tag.getAll.useQuery();
  const createTag = api.tag.create.useMutation({
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

  const updateTag = api.tag.update.useMutation({
    onSuccess: () => {
      toast.success(t("message.success"));
      setEditingTag(null);
      resetForm();
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTag = api.tag.delete.useMutation({
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
    });
  };

  const handleCreate = () => {
    void createTag.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingTag) return;
    void updateTag.mutate({
      id: editingTag.id,
      data: formData,
    });
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name_vi: tag.name_vi,
      name_en: tag.name_en ?? "",
      category: tag.category ?? "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t("message.confirmDelete"))) {
      void deleteTag.mutate({ id });
    }
  };

  // Group tags by category
  const groupedTags = tags?.reduce((acc, tag) => {
    const category = tag.category ?? "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("nav.tags")}</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("action.create")}
        </Button>
      </div>

      {Object.entries(groupedTags ?? {}).map(([category, categoryTags]) => (
        <Card key={category} className="mb-6">
          <CardHeader>
            <CardTitle>
              {TAG_CATEGORIES.find((c) => c.value === category)
                ?.[language === "vi" ? "label_vi" : "label_en"] ?? category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tag.name")} (Tiếng Việt)</TableHead>
                  <TableHead>{t("tag.name")} (English)</TableHead>
                  <TableHead className="text-right">{t("action.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name_vi}</TableCell>
                    <TableCell>{tag.name_en ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
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
      ))}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen ?? !!editingTag}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingTag(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? t("action.edit") : t("action.create")} Tag
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name_vi">Tag Name (Tiếng Việt) *</Label>
              <Input
                id="name_vi"
                value={formData.name_vi}
                onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name_en">Tag Name (English)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === "vi" ? cat.label_vi : cat.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setEditingTag(null);
              resetForm();
            }}>
              {t("action.cancel")}
            </Button>
            <Button
              onClick={editingTag ? handleUpdate : handleCreate}
              disabled={!formData.name_vi}
            >
              {t("action.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}