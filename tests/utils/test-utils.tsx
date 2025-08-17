import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

// Mock session data
export const mockSession: Session = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "admin",
    language_preference: "vi",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockUserSession: Session = {
  user: {
    id: "test-user-id",
    email: "user@example.com",
    name: "Test User",
    role: "user",
    language_preference: "vi",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Create a test query client
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    session = mockSession,
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

// Language context mock
export const mockLanguageContext = {
  language: "vi" as const,
  setLanguage: vi.fn(),
  t: vi.fn((key: string) => {
    // Simple translation mock - in real app you'd want more sophisticated mapping
    const translations: Record<string, string> = {
      "message.loading": "Loading...",
      "message.success": "Success!",
      "message.error": "Error occurred",
      "dish.difficulty.easy": "Easy",
      "dish.difficulty.medium": "Medium",
      "dish.difficulty.hard": "Hard",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.add": "Add",
      "common.search": "Search",
      "ingredient.name": "Ingredient Name",
      "ingredient.category": "Category",
      "ingredient.price": "Price",
      "dish.name": "Dish Name",
      "dish.description": "Description",
      "dish.instructions": "Instructions",
    };
    return translations[key] || key;
  }),
};

// Mock useLanguage hook
vi.mock("@/app/(protected)/_context/language", () => ({
  useLanguage: () => mockLanguageContext,
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Utility for testing async components
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Form testing utilities
export const fillInput = async (input: HTMLElement, value: string) => {
  const userEvent = (await import("@testing-library/user-event")).default;
  const user = userEvent.setup();
  await user.clear(input);
  await user.type(input, value);
};

export const selectOption = async (select: HTMLElement, value: string) => {
  const userEvent = (await import("@testing-library/user-event")).default;
  const user = userEvent.setup();
  await user.selectOptions(select, value);
};

export const clickButton = async (button: HTMLElement) => {
  const userEvent = (await import("@testing-library/user-event")).default;
  const user = userEvent.setup();
  await user.click(button);
};

// API testing utilities
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

export const mockApiError = (
  status = 500,
  message = "Internal Server Error",
) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  text: async () => JSON.stringify({ error: message }),
});

// Console utilities for testing
export const suppressConsoleError = () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });
};

export const suppressConsoleWarn = () => {
  const originalWarn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });
};

// Re-export everything from RTL
export * from "@testing-library/react";
export { renderWithProviders as render };
