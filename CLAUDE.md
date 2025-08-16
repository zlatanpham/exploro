# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Setup

- `./start-database.sh` - Start PostgreSQL database using Docker
- `pnpm run db:generate` - Run Prisma migrations in development
- `pnpm run db:migrate` - Deploy Prisma migrations
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:studio` - Open Prisma Studio for database inspection

### Development

- `pnpm run dev` - Start development server with Turbo (http://localhost:3000)
- `pnpm run build` - Build production application
- `pnpm run start` - Start production server
- `pnpm run preview` - Build and start production server

### Code Quality

- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Run ESLint with auto-fix
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run check` - Run both linting and type checking
- `pnpm run format:check` - Check code formatting with Prettier
- `pnpm run format:write` - Format code with Prettier

### Testing

- `pnpm run test` - Run tests in watch mode (development)
- `pnpm run test:ui` - Run tests with interactive UI
- `pnpm run test:run` - Run all tests once (CI/CD)
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:coverage` - Generate coverage report
- `pnpm run test:coverage:ui` - Generate coverage with UI

### UI Components

- `pnpm run ui:add` - Add new shadcn/ui components

## Application Architecture

### Core Concept

This is **Next Starter** - a full-stack Next.js 15 boilerplate with authentication, database setup, and modern tooling. It provides a clean foundation for building web applications with user authentication and multi-tenant organization support.

### Tech Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC for type-safe APIs, NextAuth.js for authentication
- **Database**: PostgreSQL with Prisma ORM
- **Email**: Resend integration for password reset functionality
- **Testing**: Vitest, React Testing Library, MSW for API mocking

### Database Schema

Core entities for authentication and multi-tenant support:

- **User** - User accounts with email/password and OAuth support
- **Account** - OAuth account connections (NextAuth)
- **Session** - User sessions (NextAuth)
- **VerificationToken** - Email verification tokens (NextAuth)
- **Organization** - Multi-tenant organization containers owned by users
- **OrganizationMember** - Organization membership with role management

### Key Architectural Patterns

#### Authentication & Authorization

- NextAuth.js with dual authentication: GitHub OAuth + email/password credentials
- Automatic organization creation during user registration
- Session-based authentication with secure session management
- Protected routes use server-side session validation
- Organization context provider for multi-tenant data access

#### API Structure

- **tRPC Routers**: `user`, `organization` (src/server/api/routers/)
- **Core API Endpoints**: `/api/auth/[...nextauth]` (NextAuth), `/api/trpc/[trpc]` (tRPC)
- **Type-safe API**: Full end-to-end type safety with tRPC and Zod validation

#### Route Protection & Layout

- **App Router**: Next.js 15 app directory with route groups
- **Protected Routes**: `(protected)/` - requires authentication, redirects to login if not authenticated
- **Public Routes**: `(public)/` - accessible without authentication (login, signup, password reset)
- **Layout Hierarchy**: Protected layout includes sidebar navigation and organization context

#### Component Architecture

- **shadcn/ui**: Radix UI primitives with Tailwind CSS styling
- **Sidebar Navigation**: Collapsible sidebar with user account management
- **Form Handling**: react-hook-form with Zod validation throughout auth flows
- **Email Integration**: React Email components for password reset emails

#### Data Management

- **Prisma ORM**: Type-safe database queries with PostgreSQL
- **tRPC Integration**: Server-side procedures with client-side React Query caching
- **Organization Context**: React context for multi-tenant data scoping
- **Session Management**: NextAuth session integration with tRPC context
- **Optimistic Updates**: Immediate UI updates with rollback on failure for better UX

### Environment Setup

Requires `.env` file with:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth session encryption key
- `NEXTAUTH_URL` - Application URL for NextAuth callbacks
- `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET` - GitHub OAuth credentials (optional)
- `RESEND_API_KEY` & `EMAIL_FROM` - Email service configuration (optional)

### Development Workflow

1. Start database with `./start-database.sh`
2. Install dependencies with `pnpm install`
3. Start development server with `pnpm run dev`
4. Use `pnpm run db:studio` for database inspection
5. Run `pnpm run check` before committing to ensure code quality

### Extending the Boilerplate

- **New tRPC Routers**: Add to `src/server/api/routers/` and register in `root.ts`
- **Database Changes**: Modify `prisma/schema.prisma` and run `pnpm run db:generate`
- **Protected Pages**: Add to `src/app/(protected)/` for authenticated access
- **UI Components**: Use `pnpm run ui:add [component]` to add new shadcn/ui components

### Accessibility Guidelines

#### Vietnamese Text Search

This application includes comprehensive Vietnamese diacritic-insensitive search functionality to improve accessibility for Vietnamese users. The search system automatically handles Vietnamese diacritics (accents) so that users can find content regardless of whether they type with or without accent marks.

**Implementation:**

- **Client-side**: Uses `normalizeVietnamese()` utility in `src/lib/utils.ts` for frontend filtering
- **Server-side**: Uses `createVietnameseSearchConditions()` utility in `src/server/utils/vietnamese.ts` for database queries using systematic character-based approach

**Coverage:**

- Ingredient search (admin panel): `/admin/ingredients`
- Dish search: `/dishes` and `/admin/dishes`
- Menu dish search: Menu edit interface

**Standard Practice:**

- All new search functionality MUST implement Vietnamese diacritic-insensitive search
- Use the existing utilities: `normalizeVietnamese()` for client-side and `createVietnameseSearchConditions()` for server-side
- The server-side approach uses systematic character-based generation (no hardcoded word lists)
- Test search functionality with both accented and non-accented Vietnamese text

**Examples:**

- Searching "bot" will find "Bột ngọt" (MSG)
- Searching "thit kho tau" will find "Thịt kho tàu" (Braised pork with eggs)
- Searching "pho bo" will find "Phở bò" (Beef pho)
- Searching "ca chua" will find "Cà chua" (Tomato dishes)

**Technical Details:**
The implementation generates systematic character variations (e.g., "a" → "à", "á", "ạ", "ả") and word combinations to create comprehensive search terms without relying on hardcoded word mappings. This ensures the search scales to any Vietnamese content without manual maintenance.

### Test-Driven Development (TDD)

This project follows TDD practices for all new features and bug fixes. The testing framework includes:

#### Testing Stack

- **Vitest**: Fast test runner with TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **Jest-DOM**: Extended DOM matchers for better assertions

#### TDD Workflow

1. **Red**: Write a failing test that describes the desired behavior
2. **Green**: Write the minimal code needed to make the test pass
3. **Refactor**: Improve the code while keeping tests green

#### Testing Categories

- **Unit Tests**: Test utility functions and pure logic (100% coverage goal)
- **Component Tests**: Test React components with user interactions (90%+ coverage goal)
- **Integration Tests**: Test API endpoints and data flow (80%+ coverage goal)

#### Required Testing Practices

- All new features MUST include tests before implementation
- Vietnamese search functionality MUST be tested with diacritic variations
- API endpoints MUST include error handling tests
- Components MUST include accessibility tests
- All tests MUST pass before code can be merged

#### Test Organization

```
tests/
├── setup.ts                 # Global test configuration
├── utils/                   # Test utilities and helpers
├── mocks/                   # MSW API mocks
├── components/              # Component tests
└── api/                     # API integration tests

src/
├── lib/__tests__/           # Utility function tests
├── server/utils/__tests__/  # Server utility tests
└── components/ui/__tests__/ # UI component tests
```

#### Coverage Requirements

- Overall coverage: 85%+
- Critical paths (auth, data flow): 95%+
- Vietnamese search utilities: 100%
- UI components: 90%+

### Optimistic Updates Pattern

For better user experience, implement optimistic updates for UI interactions that modify server state:

**Implementation Pattern:**

```typescript
const utils = api.useUtils();
const mutation = api.example.mutate.useMutation({
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await utils.example.getData.cancel();

    // Snapshot previous value
    const previousData = utils.example.getData.getData();

    // Optimistically update cache
    utils.example.getData.setData(variables.id, (old) => ({
      ...old,
      // Apply optimistic changes
    }));

    return { previousData };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousData) {
      utils.example.getData.setData(variables.id, context.previousData);
    }
  },
  onSettled: () => {
    // Sync with server state
    void utils.example.getData.invalidate();
  },
});
```

**Usage Guidelines:**

- Always implement optimistic updates for favorites, likes, toggles, and similar instant feedback actions
- Use `onMutate` to immediately update the UI
- Store previous state in context for rollback capability
- Handle errors gracefully with `onError` rollback
- Always sync with server state in `onSettled`
- Cancel ongoing queries with `utils.query.cancel()` to prevent race conditions

**Current Implementation:**

- Favorite/unfavorite dishes: Immediate heart icon feedback with server sync
- All toggle-based interactions should follow this pattern
