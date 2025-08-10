/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect } from "react";

export default function ApiDocsPage() {
  useEffect(() => {
    // @ts-expect-error
    if (typeof window !== "undefined" && window.SwaggerUIBundle) {
      // @ts-expect-error
      window.SwaggerUIBundle({
        url: "/api/v1/docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          // @ts-expect-error
          window.SwaggerUIBundle.presets.apis,
          // @ts-expect-error
          window.SwaggerUIStandalonePreset,
        ],
        plugins: [
          // @ts-expect-error
          window.SwaggerUIBundle.plugins.DownloadUrl,
        ],
        layout: "StandaloneLayout",
      });
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Explore and test the Exploro API endpoints
        </p>
      </div>

      <div className="prose mb-8 max-w-none">
        <h2>Getting Started</h2>
        <p>
          To use the Exploro API, you need an API key. You can generate one from
          the <a href="/admin/api-keys">API Keys</a> page.
        </p>

        <h3>Authentication</h3>
        <p>Include your API key in the Authorization header:</p>
        <pre className="bg-muted rounded-lg p-4">
          <code>Authorization: Bearer sk_live_your_api_key_here</code>
        </pre>

        <h3>Base URL</h3>
        <pre className="bg-muted rounded-lg p-4">
          <code>
            {process.env.NEXT_PUBLIC_APP_URL || "https://exploro.app"}/api/v1
          </code>
        </pre>

        <h3>Rate Limits</h3>
        <ul>
          <li>Standard endpoints: 1,000 requests/hour</li>
          <li>Batch endpoints: 100 requests/hour</li>
          <li>Search endpoints: 500 requests/hour</li>
        </ul>

        <h3>Response Headers</h3>
        <p>All responses include rate limit information:</p>
        <ul>
          <li>
            <code>X-RateLimit-Limit</code> - Your rate limit
          </li>
          <li>
            <code>X-RateLimit-Remaining</code> - Requests remaining
          </li>
          <li>
            <code>X-RateLimit-Reset</code> - Unix timestamp when limit resets
          </li>
          <li>
            <code>X-Request-ID</code> - Unique request identifier
          </li>
        </ul>

        <h3>Error Handling</h3>
        <p>Errors are returned in a consistent format:</p>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4">
          {`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "request_id": "unique-request-id"
  }
}`}
        </pre>

        <h2>Quick Examples</h2>

        <h3>List Ingredients</h3>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4">
          {`curl -X GET https://exploro.app/api/v1/ingredients \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json"`}
        </pre>

        <h3>Create an Ingredient</h3>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4">
          {`curl -X POST https://exploro.app/api/v1/ingredients \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ingredient": {
      "name_vi": "Thịt bò",
      "name_en": "Beef",
      "category": "meat",
      "default_unit": "kg",
      "current_price": 280000
    }
  }'`}
        </pre>

        <h3>Batch Create Ingredients</h3>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4">
          {`curl -X POST https://exploro.app/api/v1/ingredients/batch \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ingredients": [
      {
        "name_vi": "Hành tím",
        "name_en": "Shallot",
        "category": "vegetables",
        "default_unit": "kg",
        "current_price": 40000
      },
      {
        "name_vi": "Tỏi",
        "name_en": "Garlic",
        "category": "vegetables",
        "default_unit": "kg",
        "current_price": 35000
      }
    ]
  }'`}
        </pre>

        <h2>API Reference</h2>
        <p>
          View the full API documentation in{" "}
          <a href="/api/v1/docs" target="_blank">
            OpenAPI format
          </a>{" "}
          or explore interactively below:
        </p>
      </div>

      {/* Swagger UI will be rendered here if we add it */}
      <div
        id="swagger-ui"
        className="rounded-lg border bg-white p-4 dark:bg-gray-950"
      >
        <p className="text-muted-foreground py-8 text-center">
          Interactive API documentation will be available here with Swagger UI
          integration.
        </p>
        <p className="text-center">
          <a
            href="/api/v1/docs"
            target="_blank"
            className="text-primary underline"
          >
            View OpenAPI Specification
          </a>
        </p>
      </div>

      {/* Add script tags for Swagger UI if needed */}
      {/* <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" /> */}
    </div>
  );
}
