import { type NextRequest, type NextResponse } from "next/server";
import {
  validateApiKey,
  hasPermission,
  logApiUsage,
  type ApiContext,
} from "./auth";
import { ApiError, handleApiError } from "./errors";
import {
  applyRateLimit,
  addRateLimitHeaders,
  type rateLimitConfigs,
} from "./rate-limit";

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context: ApiContext,
  routeParams?: T,
) => Promise<NextResponse>;

interface ApiRouteOptions {
  requiredPermission?: "read" | "write" | "admin";
  rateLimitConfig?: keyof typeof rateLimitConfigs;
}

export function withApiAuth<T = unknown>(
  handler: ApiHandler<T>,
  options: ApiRouteOptions = {},
): (request: NextRequest, routeParams?: T) => Promise<NextResponse> {
  return async (request: NextRequest, routeParams?: T) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      // Validate API key
      const context = await validateApiKey(request);

      if (!context) {
        throw new ApiError("INVALID_API_KEY");
      }

      // Check permissions
      if (options.requiredPermission) {
        if (!hasPermission(context, options.requiredPermission)) {
          throw new ApiError("PERMISSION_DENIED", {
            required: options.requiredPermission,
            actual: context.apiKey.permissions,
          });
        }
      }

      // Apply rate limiting
      const rateLimitInfo = await applyRateLimit(
        request,
        context.apiKey.id,
        options.rateLimitConfig || "standard",
      );

      // Execute the handler
      const response = await handler(request, context, routeParams);

      // Add rate limit headers
      addRateLimitHeaders(response, rateLimitInfo);

      // Add request ID header
      response.headers.set("X-Request-ID", requestId);

      // Log API usage
      const responseTime = Date.now() - startTime;
      await logApiUsage(context.apiKey.id, request, {
        status_code: response.status,
        response_time: responseTime,
      });

      return response;
    } catch {
      const responseTime = Date.now() - startTime;

      // Log failed request if we have an API key
      const context = await validateApiKey(request);
      if (context) {
        await logApiUsage(context.apiKey.id, request, {
          status_code: error instanceof ApiError ? error.statusCode : 500,
          response_time: responseTime,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        });
      }

      return handleApiError(error, requestId);
    }
  };
}

// Helper function to parse and validate JSON body
export async function parseJsonBody<T>(
  request: NextRequest,
  validator?: (data: unknown) => T,
): Promise<T> {
  try {
    const body = await request.json();

    if (validator) {
      return validator(body);
    }

    return body as T;
  } catch {
    throw new ApiError("VALIDATION_ERROR", {
      message: "Invalid JSON in request body",
    });
  }
}

// Helper function to get query parameters
export function getQueryParams(request: NextRequest): URLSearchParams {
  return request.nextUrl.searchParams;
}

// Helper function for pagination
export interface PaginationParams {
  limit: number;
  offset: number;
}

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaults = { limit: 50, offset: 0 },
  maxLimit = 200,
): PaginationParams {
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(defaults.limit)),
    maxLimit,
  );
  const offset = parseInt(
    searchParams.get("offset") || String(defaults.offset),
  );

  return {
    limit: isNaN(limit) ? defaults.limit : limit,
    offset: isNaN(offset) ? defaults.offset : offset,
  };
}
