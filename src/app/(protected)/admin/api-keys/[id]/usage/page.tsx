"use client";

import { use, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, Activity, Clock, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApiKeyUsagePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = api.apiKey.getUsageStats.useQuery({ id });

  const endpointStats = useMemo(() => {
    if (!data?.stats) return [];

    const grouped = data.stats.reduce(
      (acc, stat) => {
        const key = `${stat.endpoint} ${stat.method}`;
        if (!acc[key]) {
          acc[key] = {
            endpoint: stat.endpoint,
            method: stat.method,
            total: 0,
            success: 0,
            errors: 0,
            avgResponseTime: 0,
            responseTimes: [],
          };
        }

        acc[key].total += stat._count;
        if (stat.status_code >= 200 && stat.status_code < 300) {
          acc[key].success += stat._count;
        } else {
          acc[key].errors += stat._count;
        }

        if (stat._avg.response_time) {
          acc[key].responseTimes.push({
            time: stat._avg.response_time,
            count: stat._count,
          });
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    // Calculate weighted average response times
    Object.values(grouped).forEach((stat: any) => {
      const totalCount = stat.responseTimes.reduce(
        (sum: number, rt: any) => sum + rt.count,
        0,
      );
      const weightedSum = stat.responseTimes.reduce(
        (sum: number, rt: any) => sum + rt.time * rt.count,
        0,
      );
      stat.avgResponseTime =
        totalCount > 0 ? Math.round(weightedSum / totalCount) : 0;
      delete stat.responseTimes;
    });

    return Object.values(grouped);
  }, [data]);

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return <Badge variant="default">Success</Badge>;
    } else if (code >= 400 && code < 500) {
      return <Badge variant="destructive">Client Error</Badge>;
    } else if (code >= 500) {
      return <Badge variant="destructive">Server Error</Badge>;
    }
    return <Badge variant="secondary">{code}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      DELETE: "bg-red-500",
    };

    return (
      <Badge
        variant="secondary"
        className={`${colors[method] || "bg-gray-500"} text-white`}
      >
        {method}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="bg-muted mb-8 h-8 w-1/3 rounded"></div>
          <div className="space-y-4">
            <div className="bg-muted h-32 rounded"></div>
            <div className="bg-muted h-64 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/api-keys")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to API Keys
        </Button>
        <h1 className="text-3xl font-bold">API Key Usage Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Detailed usage statistics and performance metrics
        </p>
      </div>

      <div className="mb-8 grid gap-6">
        {/* Endpoint Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Statistics</CardTitle>
            <CardDescription>
              Request counts and performance by endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            {endpointStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Total Requests</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpointStats.map((stat: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {stat.endpoint}
                      </TableCell>
                      <TableCell>{getMethodBadge(stat.method)}</TableCell>
                      <TableCell>{stat.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {stat.total > 0
                              ? Math.round((stat.success / stat.total) * 100)
                              : 0}
                            %
                          </span>
                          {stat.errors > 0 && (
                            <span className="text-muted-foreground text-xs">
                              ({stat.errors} errors)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="text-muted-foreground h-3 w-3" />
                          <span>{stat.avgResponseTime}ms</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  No usage data available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>
              Last 100 API requests made with this key
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentLogs && data.recentLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.endpoint}
                      </TableCell>
                      <TableCell>{getMethodBadge(log.method)}</TableCell>
                      <TableCell>{getStatusBadge(log.status_code)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="text-muted-foreground h-3 w-3" />
                          <span className="text-sm">{log.response_time}ms</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.error_message && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="text-destructive h-3 w-3" />
                            <span className="text-destructive max-w-xs truncate text-sm">
                              {log.error_message}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  No recent requests to display
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
