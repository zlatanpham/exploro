"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Copy,
  Key,
  MoreVertical,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApiKeyFormData {
  name: string;
  permissions: ("read" | "write" | "admin")[];
  expires_at?: Date;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: "",
    permissions: ["read", "write"],
  });

  const { data: apiKeys, refetch } = api.apiKey.list.useQuery();
  const createMutation = api.apiKey.create.useMutation();
  const revokeMutation = api.apiKey.revoke.useMutation();

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync(formData);
      setNewKey(result.key);
      setShowKey(true);
      setIsCreateOpen(false);
      await refetch();
      toast.success("API key created successfully");
    } catch (error) {
      toast.error("Failed to create API key");
    }
  };

  const handleRevoke = async () => {
    if (!selectedKeyId) return;

    try {
      await revokeMutation.mutateAsync({
        id: selectedKeyId,
        reason: revokeReason,
      });
      setIsRevokeOpen(false);
      setSelectedKeyId(null);
      setRevokeReason("");
      await refetch();
      toast.success("API key revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handlePermissionToggle = (permission: "read" | "write" | "admin") => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage API keys for external system integrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Create and manage API keys for programmatic access
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for external integrations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., POS Integration"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="read"
                          checked={formData.permissions.includes("read")}
                          onCheckedChange={() => handlePermissionToggle("read")}
                        />
                        <Label htmlFor="read" className="font-normal">
                          Read - View ingredients, dishes, and menus
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="write"
                          checked={formData.permissions.includes("write")}
                          onCheckedChange={() =>
                            handlePermissionToggle("write")
                          }
                        />
                        <Label htmlFor="write" className="font-normal">
                          Write - Create and update data
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="admin"
                          checked={formData.permissions.includes("admin")}
                          onCheckedChange={() =>
                            handlePermissionToggle("admin")
                          }
                        />
                        <Label htmlFor="admin" className="font-normal">
                          Admin - Delete data and manage settings
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={
                      !formData.name || formData.permissions.length === 0
                    }
                  >
                    Create Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Preview</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="text-sm">{apiKey.key_preview}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {apiKey.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{apiKey.usage_count} requests</TableCell>
                    <TableCell>
                      {format(new Date(apiKey.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {apiKey.last_used_at
                        ? format(new Date(apiKey.last_used_at), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {apiKey.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/api-keys/${apiKey.id}/usage`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Usage
                          </DropdownMenuItem>
                          {apiKey.is_active && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedKeyId(apiKey.id);
                                setIsRevokeOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Revoke Key
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Key className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                No API keys created yet. Create your first key to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Display Dialog */}
      <Dialog open={showKey} onOpenChange={setShowKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              <div className="mt-2 flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Save this key now. You won&apos;t be able to see it again!
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your API Key</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input value={newKey} readOnly className="font-mono text-sm" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(newKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm">
                <strong>Usage:</strong> Include this key in your API requests:
              </p>
              <code className="mt-2 block text-xs">
                Authorization: Bearer {newKey}
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKey(false)}>
              I&apos;ve saved the key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The API key will be immediately
              invalidated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="reason">Reason for revocation (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Security concern, no longer needed"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
