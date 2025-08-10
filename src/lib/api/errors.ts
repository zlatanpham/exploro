import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_API_KEY"
  | "PERMISSION_DENIED"
  | "RATE_LIMIT_EXCEEDED"
  | "DUPLICATE_INGREDIENT"
  | "INGREDIENT_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "ORGANIZATION_MISMATCH"
  | "INTERNAL_ERROR"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED";

interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

const errorMap: Record<ApiErrorCode, Omit<ApiErrorDetails, "code">> = {
  INVALID_API_KEY: {
    message: "Invalid or missing API key",
    statusCode: 401,
  },
  PERMISSION_DENIED: {
    message: "Insufficient permissions for this operation",
    statusCode: 403,
  },
  RATE_LIMIT_EXCEEDED: {
    message: "Too many requests. Please slow down.",
    statusCode: 429,
  },
  DUPLICATE_INGREDIENT: {
    message: "An ingredient with this name already exists",
    statusCode: 409,
  },
  INGREDIENT_NOT_FOUND: {
    message: "The specified ingredient was not found",
    statusCode: 404,
  },
  VALIDATION_ERROR: {
    message: "Invalid request data",
    statusCode: 400,
  },
  ORGANIZATION_MISMATCH: {
    message: "Resource belongs to a different organization",
    statusCode: 403,
  },
  INTERNAL_ERROR: {
    message: "An internal server error occurred",
    statusCode: 500,
  },
  NOT_FOUND: {
    message: "The requested resource was not found",
    statusCode: 404,
  },
  METHOD_NOT_ALLOWED: {
    message: "This HTTP method is not allowed for this endpoint",
    statusCode: 405,
  },
};

export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode: number;
  details?: Record<string, any>;

  constructor(code: ApiErrorCode, details?: Record<string, any>) {
    const errorInfo = errorMap[code];
    super(errorInfo.message);
    this.code = code;
    this.statusCode = errorInfo.statusCode;
    this.details = details;
  }

  toResponse(requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
          request_id: requestId || crypto.randomUUID(),
        },
      },
      { status: this.statusCode },
    );
  }
}

export function handleApiError(
  error: unknown,
  requestId?: string,
): NextResponse {
  if (error instanceof ApiError) {
    return error.toResponse(requestId);
  }

  console.error("Unhandled API error:", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred",
        request_id: requestId || crypto.randomUUID(),
      },
    },
    { status: 500 },
  );
}
