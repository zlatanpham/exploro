"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ApiDocsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the API Keys page with docs tab
    router.push("/admin/api-keys?tab=docs");
  }, [router]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Redirecting to API Keys page...
        </p>
      </div>
    </div>
  );
}
