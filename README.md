# Textile Production Management System — Frontend

Next.js 15 App Router frontend for the Textile Production Management System. Consumes the Express backend at `NEXT_PUBLIC_API_URL`. Supports two roles — `super_admin` (full access) and `admin` (permission-gated per module).

> For full architecture, conventions, and rules, see [CLAUDE.md](./CLAUDE.md) — the single source of truth for this codebase.

---

## Overview

The system manages textile firm operations across these modules:

**Beam Qualities → Production Qualities → Firms → Mills → Machines → Beams → Production Info → Taka (auto-generated) → Mill Outvert → Mill Invert → Machine Info (view) → Mill Summary (view)**

Permissions are stored in Zustand after login — no per-page permission API calls.

---

## Tech Stack

| Layer            | Choice                                  |
| ---------------- | --------------------------------------- |
| Framework        | Next.js 15 (App Router)                 |
| Language         | TypeScript (strict)                     |
| Styling          | Tailwind CSS 3                          |
| Components       | shadcn/ui (Radix UI primitives)         |
| Theme            | next-themes                             |
| Icons            | lucide-react (only icon library)        |
| Toasts           | sonner (only toast library)             |
| Global state     | Zustand 5                               |
| Server data      | TanStack Query 5                        |
| Forms            | React Hook Form + Zod                   |
| Tables           | TanStack Table 8                        |
| HTTP             | Axios                                   |
| Date picker      | react-day-picker + date-fns             |
| Charts           | recharts                                |
| Type generation  | openapi-typescript                      |
| Testing          | Playwright                              |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
JWT_ACCESS_SECRET="same-value-as-backend"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate API types

After any backend schema change, regenerate the OpenAPI types:

```bash
npm run generate:types
```

This produces `src/types/api.d.ts` (git-ignored). Application code imports types via `src/types/app.ts`.

> `prebuild` runs `generate:types` automatically. For `npm run dev`, run it once manually after backend changes.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Reference Sources

- **UI:** Figma is the authority on layouts, spacing, typography, colours, table designs, badges, empty states, and loading skeletons. Open the relevant Figma frame before building any page or component.
- **API:** Swagger at [http://localhost:4000/api/v1/api-docs/](http://localhost:4000/api/v1/api-docs/) is authoritative for endpoint paths and request/response shapes. OpenAPI JSON: `http://localhost:4000/api/v1/api-docs.json`.
- **Business rules / conventions:** [CLAUDE.md](./CLAUDE.md).

---

## Project Structure

```
src/
├── app/                # App Router pages — (auth) and (dashboard) groups
├── components/
│   ├── ui/             # shadcn/ui — do not edit manually
│   ├── common/         # Generic reusable (FormDialog, ConfirmDialog, MillStatusBadge…)
│   ├── layout/         # Sidebar, Header, PageHeader, MobileNav
│   ├── data/           # DataTable, SearchBar, FilterPanel, FirmFilter…
│   ├── forms/          # InputField, SelectField, DatePickerField, OrderedFields…
│   └── modules/        # Module-specific forms and dialogs
├── lib/
│   ├── routes.ts       # SINGLE source of truth for route paths
│   ├── api/            # Axios client + central request helper + per-module API
│   ├── actions/        # Plain async wrappers (auth.actions.ts uses "use server")
│   ├── hooks/          # useAuth, usePermission, useFirms, useFieldOrder…
│   ├── store/          # Zustand auth store
│   ├── schemas/        # Zod schemas
│   └── utils/          # cn, formatDate, handleError…
├── types/
│   ├── api.d.ts        # Generated (git-ignored)
│   └── app.ts          # Manual + re-exported app types
└── middleware.ts       # Server-side auth guard
```

---

## Key Conventions

- All route paths come from `ROUTES` in [src/lib/routes.ts](src/lib/routes.ts) — never hardcode strings.
- All API calls go through `src/lib/api/request.ts` (CRUD) or `src/lib/api/auth.ts` (auth flows). Never call `apiClient` directly from components.
- All types are imported from `@/types/app` — never from `@/types/api`.
- All form fields use the common components in `src/components/forms/`. Multi-field create/edit forms wrap inputs in `OrderedFields` and require a `PageHeader` on the page.
- All dialogs use `FormDialog` (create/edit) or `ConfirmDialog` (delete).
- All errors surface via `showErrorToast(err)` — never `toast.error(err)` directly.
- `accessToken` lives in Zustand (in-memory only). `refreshToken` is an HttpOnly cookie owned by the server actions.
- Domain actions are plain async functions (no `"use server"`). Only `auth.actions.ts` uses `"use server"` because it needs `cookies()`.
- Cache invalidation lives in components via `queryClient.invalidateQueries` — never `revalidatePath` in domain actions.
- Permission gating: every action button and write operation must be wrapped in `PermissionGate`.

For the full list of rules and the "What NOT to do" catalogue, see [CLAUDE.md](./CLAUDE.md).

---

## Scripts

| Script                   | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `npm run dev`            | Start dev server on port 3000                    |
| `npm run build`          | Production build (auto-runs `generate:types`)    |
| `npm run start`          | Run production build                             |
| `npm run lint`           | Lint with ESLint                                 |
| `npm run generate:types` | Regenerate `src/types/api.d.ts` from OpenAPI spec |

---

## Roles & Permissions

- **super_admin** — full access to every module, including admin user management (`/admin/users`, `/admin/pending-users`, `/admin/permissions/[userId]`).
- **admin** — module-scoped permissions (`canView`, `canCreate`, `canEdit`, `canDelete`) stored in Zustand after login. Checked via `usePermission(module, action)` and `PermissionGate`.

---

## Deployment

Frontend and backend are expected to live on different origins in production. The local Next.js route handler at [src/app/api/auth/refresh/route.ts](src/app/api/auth/refresh/route.ts) proxies refresh requests so the HttpOnly `refreshToken` cookie can be forwarded cross-origin.
