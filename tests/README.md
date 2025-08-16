# Testing Documentation

This document provides comprehensive information about the testing setup and practices for the Exploro application.

## Overview

The testing framework is built on **Vitest** with React Testing Library for component testing and MSW (Mock Service Worker) for API mocking. This setup enables Test-Driven Development (TDD) practices across the entire application.

## Tech Stack

- **Test Runner**: Vitest (fast, modern test runner with TypeScript support)
- **Component Testing**: React Testing Library (simple, accessible component testing)
- **Mocking**: MSW (Mock Service Worker for API mocking)
- **Assertions**: Vitest built-in matchers + jest-dom matchers
- **Coverage**: V8 coverage provider

## Test Scripts

```bash
# Run tests in watch mode (development)
pnpm test

# Run tests with UI interface
pnpm test:ui

# Run all tests once (CI/CD)
pnpm test:run

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Generate coverage with UI
pnpm test:coverage:ui
```

## Project Structure

```
tests/
├── setup.ts                 # Global test setup and configuration
├── utils/
│   ├── test-utils.tsx       # Custom render functions and test utilities
│   └── api-test-utils.ts    # API testing utilities and helpers
├── mocks/
│   ├── server.ts            # MSW server setup
│   └── handlers.ts          # API request handlers
├── components/              # Component tests
│   └── *.test.tsx
└── api/                     # API integration tests
    └── *.test.ts

src/
├── lib/__tests__/           # Utility function tests
├── server/utils/__tests__/  # Server utility tests
└── components/ui/__tests__/ # UI component tests
```

## Testing Patterns

### 1. Unit Tests (Utilities)

Test pure functions and utility libraries:

```typescript
// src/lib/__tests__/utils.test.ts
import { normalizeVietnamese } from "../utils";

describe("normalizeVietnamese", () => {
  it("should remove Vietnamese diacritics", () => {
    expect(normalizeVietnamese("phở")).toBe("pho");
    expect(normalizeVietnamese("bánh mì")).toBe("banh mi");
  });
});
```

**Coverage**: Aim for 100% coverage on utility functions

### 2. Component Tests

Test React components with user interactions:

```typescript
// src/components/ui/__tests__/button.test.tsx
import { render, screen } from '../../../tests/utils/test-utils'
import { Button } from '../button'

describe('Button Component', () => {
  it('should render and handle clicks', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

**Focus Areas**:

- User interactions
- Props and variants
- Accessibility
- Loading states
- Error states

### 3. API Integration Tests

Test API endpoints with realistic scenarios:

```typescript
// tests/api/ingredients.test.ts
describe("GET /api/v1/ingredients", () => {
  it("should fetch ingredients with pagination", async () => {
    const response = await fetch("/api/v1/ingredients?page=1&limit=10");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.pagination).toBeDefined();
  });
});
```

**Coverage**:

- Success scenarios
- Error handling
- Validation
- Vietnamese search functionality
- Authentication and authorization

## Test Utilities

### Custom Render Function

Use `renderWithProviders` for components that need React Query and auth context:

```typescript
import { renderWithProviders as render } from '../../tests/utils/test-utils'

// Renders with all necessary providers
render(<MyComponent />)

// With custom session
render(<MyComponent />, { session: mockUserSession })

// With custom query client
render(<MyComponent />, { queryClient: customClient })
```

### API Mocking

Use the API test utilities for consistent mocking:

```typescript
import { mockIngredientsApi } from "../../tests/utils/api-test-utils";

// Mock successful API calls
mockIngredientsApi.getAll(mockIngredients);
mockIngredientsApi.getById("1", mockIngredient);

// Mock API errors
mockIngredientsApi.error(500, "Internal Server Error");
```

### Form Testing

Common patterns for testing forms:

```typescript
import {
  fillInput,
  selectOption,
  clickButton,
} from "../../tests/utils/test-utils";

// Fill form inputs
await fillInput(screen.getByLabelText("Name"), "Test Ingredient");
await selectOption(screen.getByLabelText("Category"), "vegetables");
await clickButton(screen.getByRole("button", { name: "Save" }));
```

## Vietnamese Text Testing

Special attention for Vietnamese diacritic-insensitive features:

```typescript
describe("Vietnamese Search", () => {
  it("should find ingredients without diacritics", () => {
    // Search "pho" should find "Phở"
    // Search "banh mi" should find "Bánh mì"
    // Test both client and server-side normalization
  });
});
```

## Test Data

### Mock Data Structure

Consistent mock data for testing:

```typescript
const mockIngredient = {
  id: "1",
  name_vi: "Thịt bò",
  name_en: "Beef",
  category: "meat",
  current_price: 250000,
  unit_id: "kg-1",
  seasonal_flag: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};
```

### Authentication States

Test different user roles and auth states:

```typescript
// Admin user
render(<Component />, { session: mockSession })

// Regular user
render(<Component />, { session: mockUserSession })

// Unauthenticated
render(<Component />, { session: null })
```

## Coverage Goals

- **Utilities**: 100% coverage (pure functions)
- **Components**: 90%+ coverage (focus on user interactions)
- **API Routes**: 80%+ coverage (happy path + error handling)
- **Overall**: 85%+ coverage

## Best Practices

### 1. Test Structure

```typescript
describe("ComponentName", () => {
  describe("Rendering", () => {
    // Test basic rendering and props
  });

  describe("Interactions", () => {
    // Test user interactions
  });

  describe("Error Handling", () => {
    // Test error states
  });

  describe("Accessibility", () => {
    // Test a11y features
  });
});
```

### 2. Descriptive Test Names

- ✅ `should display error message when API call fails`
- ✅ `should disable submit button when form is invalid`
- ❌ `should work correctly`
- ❌ `test API`

### 3. User-Centric Testing

Focus on what users do, not implementation details:

```typescript
// ✅ Good - tests user behavior
await user.click(screen.getByRole("button", { name: "Save" }));
expect(screen.getByText("Saved successfully")).toBeInTheDocument();

// ❌ Avoid - tests implementation
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

### 4. Async Testing

Properly handle async operations:

```typescript
// Wait for elements to appear
await waitFor(() => {
  expect(screen.getByText("Loading complete")).toBeInTheDocument();
});

// Wait for elements to disappear
await waitForElementToBeRemoved(screen.getByText("Loading..."));
```

### 5. Error Testing

Test error boundaries and error states:

```typescript
// Mock console.error for error boundary tests
const suppressConsoleError = () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });
};
```

## Debugging Tests

### Debug Utilities

```typescript
// Debug rendered component
screen.debug();

// Debug specific element
screen.debug(screen.getByRole("button"));

// Log available queries
screen.logTestingPlaygroundURL();
```

### Common Issues

1. **Act Warnings**: Wrap async operations in `waitFor`
2. **Not Found Elements**: Use `findBy*` for async elements
3. **MSW Not Working**: Check server setup in `tests/setup.ts`
4. **TypeScript Errors**: Check mock types match real types

## TDD Workflow

1. **Red**: Write failing test first
2. **Green**: Write minimal code to make test pass
3. **Refactor**: Improve code while keeping tests green

### Example TDD Cycle

```typescript
// 1. RED - Write failing test
it("should calculate total cost for dish", () => {
  const dish = { ingredients: [mockIngredient] };
  expect(calculateTotalCost(dish)).toBe(250000);
});

// 2. GREEN - Implement function
function calculateTotalCost(dish) {
  return dish.ingredients.reduce((total, ing) => total + ing.cost, 0);
}

// 3. REFACTOR - Improve implementation
function calculateTotalCost(dish: Dish): number {
  return dish.ingredients.reduce((total, ingredient) => {
    return total + ingredient.quantity * ingredient.price_per_unit;
  }, 0);
}
```

## CI/CD Integration

Tests run automatically on:

- Pre-commit hooks (lint-staged)
- Pull requests
- Main branch pushes
- Release builds

### GitHub Actions Example

```yaml
- name: Run tests
  run: pnpm test:run

- name: Generate coverage
  run: pnpm test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Maintenance

- Review and update test data regularly
- Keep mock API responses in sync with real API
- Update tests when business logic changes
- Remove obsolete tests for removed features
- Monitor test performance and optimize slow tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
