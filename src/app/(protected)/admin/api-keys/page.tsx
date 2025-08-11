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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ApiKeyFormData {
  name: string;
  permissions: ("read" | "write" | "admin")[];
  expires_at?: Date;
}

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  rateLimit?: string;
}

const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/v1/decks",
    description: "List your decks",
  },
  {
    method: "POST",
    path: "/api/v1/decks",
    description: "Create a new deck",
  },
  {
    method: "POST",
    path: "/api/v1/decks/{deckId}/cards/batch",
    description: "Add multiple cards",
    rateLimit: "batch",
  },
  {
    method: "GET",
    path: "/api/v1/study/queue",
    description: "Get cards due for review",
  },
  {
    method: "GET",
    path: "/api/v1/ingredients",
    description: "List ingredients",
  },
  {
    method: "POST",
    path: "/api/v1/ingredients",
    description: "Create ingredient",
  },
  {
    method: "POST",
    path: "/api/v1/ingredients/batch",
    description: "Batch create ingredients",
    rateLimit: "batch",
  },
  {
    method: "GET",
    path: "/api/v1/dishes",
    description: "List dishes",
  },
  {
    method: "POST",
    path: "/api/v1/dishes",
    description: "Create dish",
  },
  {
    method: "POST",
    path: "/api/v1/dishes/batch",
    description: "Batch create dishes",
    rateLimit: "batch",
  },
  {
    method: "GET",
    path: "/api/v1/tags",
    description: "List tags",
  },
  {
    method: "GET",
    path: "/api/v1/menus",
    description: "List menus",
  },
  {
    method: "GET",
    path: "/api/v1/units",
    description: "List all units with categories",
  },
  {
    method: "GET",
    path: "/api/v1/units/categories",
    description: "List unit categories",
  },
  {
    method: "GET",
    path: "/api/v1/units/conversions",
    description: "Get unit conversion factors",
  },
];

const getEndpointExamples = (method: string, path: string) => {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${baseUrl}${path}`;

  if (method === "GET") {
    const isUnits = path.includes("units");
    const queryParams =
      isUnits && path === "/api/v1/units" ? "?include_category=true" : "";

    return {
      curl: `curl -X GET "${fullUrl}${queryParams}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,

      python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('${fullUrl}${queryParams}', headers=headers)
print(response.json())`,

      javascript: `const response = await fetch('${fullUrl}${queryParams}', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
    };
  } else if (method === "POST") {
    const isIngredient = path.includes("ingredients");
    const isDish = path.includes("dishes");
    const isDeck = path.includes("decks");
    const isBatch = path.includes("batch");

    let sampleData = "{}";
    if (isIngredient && !isBatch) {
      sampleData = `{
  "ingredient": {
    "name_vi": "Thịt bò",
    "name_en": "Beef",
    "category": "meat",
    "default_unit": "kg",
    "current_price": 280000
  }
}`;
    } else if (isIngredient && isBatch) {
      sampleData = `{
  "ingredients": [
    {
      "name_vi": "Hành tím",
      "name_en": "Shallot",
      "category": "vegetables",
      "default_unit": "kg",
      "current_price": 40000
    }
  ]
}`;
    } else if (isDish && !isBatch) {
      sampleData = `{
  "dish": {
    "name_vi": "Phở Bò",
    "name_en": "Beef Pho",
    "description_vi": "Món phở truyền thống",
    "difficulty": "medium",
    "cook_time": 180
  },
  "ingredients": [],
  "tags": []
}`;
    } else if (isDeck) {
      sampleData = `{
  "deck": {
    "name": "Vietnamese Vocabulary",
    "description": "Essential Vietnamese words"
  }
}`;
    }

    return {
      curl: `curl -X POST "${fullUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${sampleData.replace(/\n/g, "\\n").replace(/  /g, "  ")}'`,

      python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

data = ${sampleData}

response = requests.post('${fullUrl}', headers=headers, json=data)
print(response.json())`,

      javascript: `const response = await fetch('${fullUrl}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${sampleData})
});

const data = await response.json();
console.log(data);`,
    };
  }

  return { curl: "", python: "", javascript: "" };
};

const getExampleCode = () => {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    curl: `curl -X GET ${baseUrl}/api/v1/ingredients \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,

    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    '${baseUrl}/api/v1/ingredients',
    headers=headers
)

print(response.json())`,

    javascript: `const response = await fetch('${baseUrl}/api/v1/ingredients', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
  };
};

function CodeBlock({ code }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <pre className="bg-muted overflow-x-auto rounded-lg p-4 pr-12">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors = {
    GET: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    POST: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    PATCH:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        colors[method as keyof typeof colors],
      )}
    >
      {method}
    </span>
  );
}

function EndpointItem({ endpoint }: { endpoint: ApiEndpoint }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const examples = getEndpointExamples(endpoint.method, endpoint.path);

  return (
    <div className="overflow-hidden rounded-lg border">
      <div
        className="hover:bg-accent/50 flex cursor-pointer items-center justify-between p-3 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <code className="font-mono text-sm">{endpoint.path}</code>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {endpoint.description}
          </span>
          {endpoint.rateLimit === "batch" && (
            <Badge variant="secondary" className="text-xs">
              Batch limit
            </Badge>
          )}
          {isExpanded ? (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-muted/20 border-t p-4">
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <CodeBlock code={examples.curl} language="bash" />
            </TabsContent>
            <TabsContent value="python">
              <CodeBlock code={examples.python} language="python" />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeBlock code={examples.javascript} language="javascript" />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
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

  const exampleCode = getExampleCode();

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
    } catch (_error) {
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
    } catch (_error) {
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
          Manage API keys for programmatic access to your flashcard data
        </p>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="keys">Active Keys</TabsTrigger>
          <TabsTrigger value="docs">API Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
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
                              onCheckedChange={() =>
                                handlePermissionToggle("read")
                              }
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
                        <TableCell className="font-medium">
                          {apiKey.name}
                        </TableCell>
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
                            ? format(
                                new Date(apiKey.last_used_at),
                                "MMM d, yyyy",
                              )
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
                                  router.push(
                                    `/admin/api-keys/${apiKey.id}/usage`,
                                  )
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
                    No API keys created yet. Create your first key to get
                    started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          {/* API Documentation Header */}
          <div>
            <h2 className="text-2xl font-bold">API Documentation</h2>
            <p className="text-muted-foreground mt-2">
              Use these API keys to authenticate requests to our REST API
            </p>
            <div className="bg-muted mt-4 rounded-lg p-4">
              <code className="text-sm">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>

          {/* Available Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
              <CardDescription>
                All endpoints require authentication using your API key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {endpoints.map((endpoint, index) => (
                  <EndpointItem key={index} endpoint={endpoint} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>
                API rate limits are applied per API key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">Default endpoints</span>
                  <span className="text-muted-foreground">
                    1000 requests/hour
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">Batch endpoints</span>
                  <span className="text-muted-foreground">
                    100 requests/hour
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Examples */}
          <Card>
            <CardHeader>
              <CardTitle>API Examples</CardTitle>
              <CardDescription>
                Example requests using different programming languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <CodeBlock code={exampleCode.curl} language="bash" />
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <CodeBlock code={exampleCode.python} language="python" />
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <CodeBlock
                    code={exampleCode.javascript}
                    language="javascript"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* API Schema Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Schema Reference</CardTitle>
              <CardDescription>
                Detailed data models, field types, and available options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ingredient" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="ingredient">Ingredient</TabsTrigger>
                  <TabsTrigger value="dish">Dish</TabsTrigger>
                  <TabsTrigger value="tag">Tag</TabsTrigger>
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="unit">Unit</TabsTrigger>
                </TabsList>

                <TabsContent value="ingredient" className="mt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Ingredient Schema</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Field</th>
                            <th className="py-2 text-left">Type</th>
                            <th className="py-2 text-left">Required</th>
                            <th className="py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          <tr className="border-b">
                            <td className="py-2">
                              <code>id</code>
                            </td>
                            <td>string</td>
                            <td>auto</td>
                            <td>Unique identifier (auto-generated)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name_vi</code>
                            </td>
                            <td>string</td>
                            <td>✓</td>
                            <td>Vietnamese name (max 255 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name_en</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>English name (max 255 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>category</code>
                            </td>
                            <td>enum</td>
                            <td>✓</td>
                            <td>Ingredient category (max 100 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>unit_id</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>Reference to Unit table</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>current_price</code>
                            </td>
                            <td>decimal</td>
                            <td>✓</td>
                            <td>Current price in VND per unit</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>density</code>
                            </td>
                            <td>decimal?</td>
                            <td>-</td>
                            <td>Density for mass-volume conversion (g/ml)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>seasonal_flag</code>
                            </td>
                            <td>boolean</td>
                            <td>-</td>
                            <td>
                              Whether ingredient is seasonal (default: false)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <h5 className="mb-2 font-medium">
                        Available Categories:
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Badge variant="outline">vegetables</Badge>
                        <Badge variant="outline">meat</Badge>
                        <Badge variant="outline">seafood</Badge>
                        <Badge variant="outline">spices</Badge>
                        <Badge variant="outline">dairy</Badge>
                        <Badge variant="outline">grains</Badge>
                        <Badge variant="outline">fruits</Badge>
                        <Badge variant="outline">sauces</Badge>
                        <Badge variant="outline">other</Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="mb-2 font-medium">Common Units:</h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <Badge variant="secondary">kg (kilogram)</Badge>
                        <Badge variant="secondary">g (gram)</Badge>
                        <Badge variant="secondary">l (liter)</Badge>
                        <Badge variant="secondary">ml (milliliter)</Badge>
                        <Badge variant="secondary">bó (bunch)</Badge>
                        <Badge variant="secondary">cái (piece)</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dish" className="mt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Dish Schema</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Field</th>
                            <th className="py-2 text-left">Type</th>
                            <th className="py-2 text-left">Required</th>
                            <th className="py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>id</code>
                            </td>
                            <td>string</td>
                            <td>auto</td>
                            <td>Unique identifier (auto-generated)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name_vi</code>
                            </td>
                            <td>string</td>
                            <td>✓</td>
                            <td>Vietnamese name (max 255 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name_en</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>English name (max 255 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>description_vi</code>
                            </td>
                            <td>text</td>
                            <td>✓</td>
                            <td>Vietnamese description</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>description_en</code>
                            </td>
                            <td>text?</td>
                            <td>-</td>
                            <td>English description</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>instructions_vi</code>
                            </td>
                            <td>text</td>
                            <td>✓</td>
                            <td>Vietnamese cooking instructions</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>instructions_en</code>
                            </td>
                            <td>text?</td>
                            <td>-</td>
                            <td>English cooking instructions</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>difficulty</code>
                            </td>
                            <td>enum</td>
                            <td>✓</td>
                            <td>Cooking difficulty level</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>cook_time</code>
                            </td>
                            <td>integer</td>
                            <td>✓</td>
                            <td>Cooking time in minutes</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>prep_time</code>
                            </td>
                            <td>integer</td>
                            <td>-</td>
                            <td>Preparation time in minutes (default: 0)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>servings</code>
                            </td>
                            <td>integer</td>
                            <td>-</td>
                            <td>Number of servings (default: 4)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>image_url</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>URL to dish image</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>source_url</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>URL to recipe source</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>status</code>
                            </td>
                            <td>enum</td>
                            <td>-</td>
                            <td>Dish status (default: &quot;active&quot;)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <h5 className="mb-2 font-medium">Difficulty Levels:</h5>
                      <div className="flex gap-2">
                        <Badge variant="outline">easy</Badge>
                        <Badge variant="outline">medium</Badge>
                        <Badge variant="outline">hard</Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="mb-2 font-medium">Status Options:</h5>
                      <div className="flex gap-2">
                        <Badge variant="outline">active</Badge>
                        <Badge variant="outline">inactive</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tag" className="mt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Tag Schema</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Field</th>
                            <th className="py-2 text-left">Type</th>
                            <th className="py-2 text-left">Required</th>
                            <th className="py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>id</code>
                            </td>
                            <td>string</td>
                            <td>auto</td>
                            <td>Unique identifier (auto-generated)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name_vi</code>
                            </td>
                            <td>string</td>
                            <td>✓</td>
                            <td>Vietnamese tag name (max 100 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name_en</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>English tag name (max 100 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>category</code>
                            </td>
                            <td>string?</td>
                            <td>-</td>
                            <td>Tag category (max 50 chars)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <h5 className="mb-2 font-medium">Tag Categories:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Badge variant="outline">cooking_method</Badge>
                        <Badge variant="outline">meal_type</Badge>
                        <Badge variant="outline">cuisine</Badge>
                        <Badge variant="outline">dietary</Badge>
                        <Badge variant="outline">occasion</Badge>
                        <Badge variant="outline">flavor</Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="mb-2 font-medium">Example Tags:</h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <Badge variant="secondary">Món chiên (Fried)</Badge>
                        <Badge variant="secondary">Món xào (Stir-fried)</Badge>
                        <Badge variant="secondary">Món nướng (Grilled)</Badge>
                        <Badge variant="secondary">Món canh (Soup)</Badge>
                        <Badge variant="secondary">Miền Bắc (Northern)</Badge>
                        <Badge variant="secondary">Miền Nam (Southern)</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="menu" className="mt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Menu Schema</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Field</th>
                            <th className="py-2 text-left">Type</th>
                            <th className="py-2 text-left">Required</th>
                            <th className="py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>id</code>
                            </td>
                            <td>string</td>
                            <td>auto</td>
                            <td>Unique identifier (auto-generated)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>name</code>
                            </td>
                            <td>string</td>
                            <td>✓</td>
                            <td>Menu name (max 255 chars)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>description</code>
                            </td>
                            <td>text?</td>
                            <td>-</td>
                            <td>Menu description</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>start_date</code>
                            </td>
                            <td>datetime?</td>
                            <td>-</td>
                            <td>Menu start date</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>end_date</code>
                            </td>
                            <td>datetime?</td>
                            <td>-</td>
                            <td>Menu end date</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>servings</code>
                            </td>
                            <td>integer</td>
                            <td>-</td>
                            <td>Number of people (default: 4)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">
                              <code>visibility</code>
                            </td>
                            <td>enum</td>
                            <td>-</td>
                            <td>
                              Menu visibility (default: &quot;private&quot;)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <h5 className="mb-2 font-medium">Visibility Options:</h5>
                      <div className="flex gap-2">
                        <Badge variant="outline">private</Badge>
                        <Badge variant="outline">public</Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="mb-2 font-medium">
                        Meal Groups (for MenuDish):
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="secondary">breakfast</Badge>
                        <Badge variant="secondary">lunch</Badge>
                        <Badge variant="secondary">dinner</Badge>
                        <Badge variant="secondary">snack</Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="mb-2 font-medium">
                        Day Index (for MenuDish):
                      </h5>
                      <p className="text-muted-foreground text-sm">
                        0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4
                        = Friday, 5 = Saturday, 6 = Sunday
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="unit" className="mt-6">
                  <div className="space-y-6">
                    {/* Unit Schema */}
                    <div>
                      <h4 className="mb-4 font-semibold">Unit Schema</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 text-left">Field</th>
                              <th className="py-2 text-left">Type</th>
                              <th className="py-2 text-left">Required</th>
                              <th className="py-2 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>id</code>
                              </td>
                              <td>string</td>
                              <td>auto</td>
                              <td>Unique identifier (auto-generated)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>category_id</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>Reference to UnitCategory</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>symbol</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>Unit symbol (max 20 chars, unique)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>name_vi</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>Vietnamese unit name (max 100 chars)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>name_en</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>English unit name (max 100 chars)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>plural_vi</code>
                              </td>
                              <td>string?</td>
                              <td>-</td>
                              <td>Vietnamese plural form</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>plural_en</code>
                              </td>
                              <td>string?</td>
                              <td>-</td>
                              <td>English plural form</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>is_base_unit</code>
                              </td>
                              <td>boolean</td>
                              <td>-</td>
                              <td>
                                Whether this is the base unit for the category
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>factor_to_base</code>
                              </td>
                              <td>decimal</td>
                              <td>✓</td>
                              <td>Conversion factor to base unit</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* UnitCategory Schema */}
                    <div>
                      <h4 className="mb-4 font-semibold">
                        UnitCategory Schema
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 text-left">Field</th>
                              <th className="py-2 text-left">Type</th>
                              <th className="py-2 text-left">Required</th>
                              <th className="py-2 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>id</code>
                              </td>
                              <td>string</td>
                              <td>auto</td>
                              <td>Unique identifier (auto-generated)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>name</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>Category name (max 50 chars, unique)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>description</code>
                              </td>
                              <td>text?</td>
                              <td>-</td>
                              <td>Category description</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* UnitConversion Schema */}
                    <div>
                      <h4 className="mb-4 font-semibold">
                        UnitConversion Schema
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 text-left">Field</th>
                              <th className="py-2 text-left">Type</th>
                              <th className="py-2 text-left">Required</th>
                              <th className="py-2 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>id</code>
                              </td>
                              <td>string</td>
                              <td>auto</td>
                              <td>Unique identifier (auto-generated)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>from_unit_id</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>Source unit reference</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>to_unit_id</code>
                              </td>
                              <td>string</td>
                              <td>✓</td>
                              <td>Target unit reference</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>factor</code>
                              </td>
                              <td>decimal</td>
                              <td>✓</td>
                              <td>Multiplication factor for conversion</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">
                                <code>is_direct</code>
                              </td>
                              <td>boolean</td>
                              <td>-</td>
                              <td>
                                Whether conversion is direct or calculated
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Unit Categories */}
                    <div className="mt-6">
                      <h5 className="mb-3 font-medium">
                        Available Unit Categories:
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                          <h6 className="mb-2 text-sm font-medium">Mass</h6>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              kg
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              g
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              mg
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              tấn
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Base unit: kg (kilogram)
                          </p>
                        </div>

                        <div className="rounded-lg border p-3">
                          <h6 className="mb-2 text-sm font-medium">Volume</h6>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              l
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              ml
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              cl
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              dl
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Base unit: l (liter)
                          </p>
                        </div>

                        <div className="rounded-lg border p-3">
                          <h6 className="mb-2 text-sm font-medium">Count</h6>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              cái
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              chiếc
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              con
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              quả
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Base unit: cái (piece)
                          </p>
                        </div>

                        <div className="rounded-lg border p-3">
                          <h6 className="mb-2 text-sm font-medium">Bundle</h6>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              bó
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              bụi
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              nải
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              chùm
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Base unit: bó (bunch)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Examples */}
                    <div className="mt-6">
                      <h5 className="mb-3 font-medium">
                        Unit Conversion Examples:
                      </h5>
                      <div className="bg-muted/30 space-y-2 rounded-lg p-4">
                        <div className="text-sm">
                          <code className="bg-background rounded px-2 py-1">
                            1 kg = 1000 g
                          </code>
                          <span className="text-muted-foreground ml-2">
                            factor_to_base: 1.0 for kg, 0.001 for g
                          </span>
                        </div>
                        <div className="text-sm">
                          <code className="bg-background rounded px-2 py-1">
                            1 l = 1000 ml
                          </code>
                          <span className="text-muted-foreground ml-2">
                            factor_to_base: 1.0 for l, 0.001 for ml
                          </span>
                        </div>
                        <div className="text-sm">
                          <code className="bg-background rounded px-2 py-1">
                            1 bó rau = ~0.3 kg
                          </code>
                          <span className="text-muted-foreground ml-2">
                            Ingredient-specific conversion via density
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* API Usage Notes */}
                    <div className="mt-6 border-t pt-4">
                      <h5 className="mb-2 font-medium">API Usage Notes:</h5>
                      <ul className="text-muted-foreground space-y-1 text-sm">
                        <li>
                          • Units are referenced by <code>unit_id</code> in
                          ingredients and dish ingredients
                        </li>
                        <li>
                          • Use <code>factor_to_base</code> to convert between
                          units within the same category
                        </li>
                        <li>
                          • Cross-category conversions require ingredient
                          density (e.g., ml to g)
                        </li>
                        <li>
                          • <code>symbol</code> field provides short notation
                          for display (kg, ml, bó)
                        </li>
                        <li>
                          • Vietnamese and English names support multilingual
                          applications
                        </li>
                        <li>
                          • Base units are the reference point for all
                          conversions in their category
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Response Headers */}
          <Card>
            <CardHeader>
              <CardTitle>Response Headers</CardTitle>
              <CardDescription>
                All API responses include the following headers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <code className="font-mono text-sm">X-RateLimit-Limit</code>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Your rate limit for the current window
                    </p>
                  </div>
                  <div>
                    <code className="font-mono text-sm">
                      X-RateLimit-Remaining
                    </code>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Number of requests remaining
                    </p>
                  </div>
                  <div>
                    <code className="font-mono text-sm">X-RateLimit-Reset</code>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Unix timestamp when the limit resets
                    </p>
                  </div>
                  <div>
                    <code className="font-mono text-sm">X-Request-ID</code>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Unique identifier for the request
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
