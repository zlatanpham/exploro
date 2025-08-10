import { type NextRequest } from "next/server";
import { db } from "@/server/db";
import bcryptjs from "bcryptjs";

export interface ApiContext {
  apiKey: {
    id: string;
    organization_id: string;
    permissions: string[];
  };
}

export async function validateApiKey(
  request: NextRequest,
): Promise<ApiContext | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token?.startsWith("sk_live_")) {
    return null;
  }

  try {
    // Find all active API keys and check each one
    // This is necessary because we need to compare hashes
    const apiKeys = await db.apiKey.findMany({
      where: {
        is_active: true,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
      select: {
        id: true,
        key_hash: true,
        organization_id: true,
        permissions: true,
      },
    });

    for (const apiKey of apiKeys) {
      const isValid = await bcryptjs.compare(token, apiKey.key_hash);
      if (isValid) {
        // Update last used timestamp and usage count
        await db.apiKey.update({
          where: { id: apiKey.id },
          data: {
            last_used_at: new Date(),
            usage_count: { increment: 1 },
          },
        });

        return {
          apiKey: {
            id: apiKey.id,
            organization_id: apiKey.organization_id,
            permissions: apiKey.permissions,
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error validating API key:", error);
    return null;
  }
}

export function hasPermission(
  context: ApiContext,
  requiredPermission: "read" | "write" | "admin",
): boolean {
  return context.apiKey.permissions.includes(requiredPermission);
}

export async function logApiUsage(
  apiKeyId: string,
  request: NextRequest,
  response: {
    status_code: number;
    response_time: number;
    error_message?: string;
  },
) {
  try {
    const requestBody =
      request.method !== "GET"
        ? await request
            .clone()
            .text()
            .catch(() => null)
        : null;

    await db.apiUsageLog.create({
      data: {
        api_key_id: apiKeyId,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        status_code: response.status_code,
        response_time: response.response_time,
        request_body: requestBody ? JSON.parse(requestBody) : null,
        error_message: response.error_message,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          null,
        user_agent: request.headers.get("user-agent"),
      },
    });
  } catch (error) {
    console.error("Error logging API usage:", error);
  }
}
