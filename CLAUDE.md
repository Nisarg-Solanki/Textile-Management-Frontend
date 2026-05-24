# CLAUDE.md — Textile Production Management System (Frontend)

> Read this file fully before writing any code.
> This is the single source of truth for the entire frontend.
> The backend CLAUDE.md is the companion document — refer to it for API contracts,
> response shapes, permission modules, and role definitions.

---

## 0. Critical References (Read Before Anything Else)

### UI Reference — Figma

- **All visual and layout decisions must reference the Figma design first.**
- Do NOT invent UI — match spacing, typography, colours, component shapes, and layout exactly as shown in Figma.
- Figma is the authority on: page layouts, sidebar structure, table designs, form layouts, card styles, badge colours, empty states, and loading skeletons.
- Figma is NOT the authority on: business logic, field validation rules, auto-fill behaviour, or permission gating — those come from the System Requirements Document and this CLAUDE.md.
- When building any new page or component, open the relevant Figma frame first. If the Figma frame does not exist for a particular screen, flag it before building.
- Use the connected Figma MCP tool to get design context: `Figma:get_design_context` with the file key and node ID.

### API Reference — Swagger / OpenAPI

- **All API contracts, request shapes, response shapes, and endpoint paths must be verified against the live Swagger docs.**
- Swagger UI: `http://localhost:4000/api/v1/api-docs/`
- OpenAPI JSON (for type generation): `http://localhost:4000/api/v1/api-docs.json`
- Never assume an endpoint path, request body shape, or response structure — check Swagger first.
- If Swagger and this CLAUDE.md conflict, Swagger wins for API contracts. Flag the discrepancy.
- Run `npm run generate:types` before starting dev after any backend schema change — this regenerates `src/types/api.d.ts` which application code imports through `src/types/app.ts`.

---

## 1. Project Overview

Next.js 15 App Router frontend for the Textile Production Management System.
Consumes the Express backend at `NEXT_PUBLIC_API_URL`.
Two roles: `super_admin` (full access) and `admin` (permission-gated per module).
All permissions are stored in Zustand after login — no permission API call per page.

**System covers modules across textile firms:**
Beam Qualities → Production Qualities → Firms → Mills → Machines → Beams →
Production Info → Taka (auto-generated) → Mill Outvert → Mill Invert →
Machine Info (view) → Mill Summary (view)

---

## 2. Tech Stack

| Layer            | Choice                          | Version                              |
| ---------------- | ------------------------------- | ------------------------------------ |
| Framework        | Next.js App Router              | 15.x                                 |
| Language         | TypeScript strict               | 5.x                                  |
| Styling          | Tailwind CSS                    | 3.x                                  |
| Component system | shadcn/ui (Radix UI primitives) | latest                               |
| Theme            | next-themes                     | latest                               |
| Icons            | lucide-react                    | ^0.475.0 — ONLY icon library allowed |
| Toasts           | sonner                          | 2.0.7 — ONLY toast library allowed   |
| Global state     | Zustand                         | 5.x                                  |
| Server data      | TanStack Query                  | 5.x                                  |
| Forms            | React Hook Form + Zod           | latest                               |
| Tables           | TanStack Table                  | 8.x                                  |
| HTTP client      | Axios                           | 1.15.2                               |
| Date picker      | react-day-picker + date-fns     | 9.x / 4.x                            |
| Charts           | recharts                        | 2.x                                  |
| Type generation  | openapi-typescript              | latest                               |
| Testing          | Playwright                      | latest                               |

**Absolute rules:**

- Do NOT use `any` type anywhere in TypeScript.
- Do NOT import icons from anywhere except `lucide-react`.
- Do NOT use any toast library except `sonner`.
- Do NOT use any UI component library beyond `shadcn/ui`.
- Do NOT use `useEffect` to fetch data — use TanStack Query or Server Components.
- Do NOT call `apiClient` directly from components — always go through `src/lib/api/request.ts`.

---

## 3. Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root — ThemeProvider, QueryProvider, Toaster
│   │   ├── globals.css                    # CSS variables for light/dark + Tailwind base
│   │   ├── not-found.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── refresh/route.ts       # Proxies POST /auth/refresh — reads HttpOnly cookie server-side
│   │   │       └── clear/route.ts         # Server route that deletes the refreshToken cookie
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                 # Redirect to /dashboard if already logged in
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx                 # Auth guard + sidebar + header
│   │       ├── page.tsx                   # Dashboard root (group landing)
│   │       ├── dashboard/page.tsx         # Dashboard overview — stats cards + production chart
│   │       ├── admin/                     # super_admin only
│   │       │   ├── pending-users/page.tsx
│   │       │   ├── users/page.tsx
│   │       │   └── permissions/
│   │       │       └── [userId]/page.tsx
│   │       ├── firms/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── edit/page.tsx
│   │       ├── mills/                     # Same structure as firms/
│   │       ├── beam-qualities/
│   │       │   └── page.tsx               # List + dialogs only — no new/edit sub-pages
│   │       ├── production-qualities/
│   │       │   └── page.tsx               # List + dialogs only — no new/edit sub-pages
│   │       ├── machines/                  # Same structure as firms/
│   │       ├── beams/                     # Same structure as firms/
│   │       ├── production/                # Same structure as firms/
│   │       ├── takas/
│   │       │   ├── page.tsx               # View only — no new/edit
│   │       │   └── [id]/page.tsx
│   │       ├── mill-outverts/             # Same structure as firms/
│   │       ├── mill-inverts/              # Same structure as firms/
│   │       ├── machine-info/
│   │       │   └── page.tsx               # View only — live machine status
│   │       ├── mill-summary/
│   │       │   └── page.tsx               # View only — status tabs
│   │       └── profile/
│   │           └── page.tsx               # User info card + reset-password dialog
│   ├── components/
│   │   ├── ui/                            # shadcn/ui — do not edit manually
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── command.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── slider.tsx
│   │   ├── common/                        # Generic reusable across ALL modules
│   │   │   ├── FormDialog.tsx             # Generic create/edit dialog wrapper
│   │   │   ├── ConfirmDialog.tsx          # Generic delete confirmation dialog
│   │   │   ├── FieldOrderButton.tsx       # Dropdown with up/down arrows — drives OrderedFields
│   │   │   └── MillStatusBadge.tsx        # Not Sent / At Mill / Returned status pill
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                # Permission-aware nav
│   │   │   ├── Header.tsx                 # Page title + theme toggle + avatar dropdown (→ /profile, logout)
│   │   │   ├── MobileNav.tsx              # Bottom tab bar on mobile
│   │   │   └── PageHeader.tsx             # Title + primary action + HEADER_ACTIONS_SLOT_ID portal target
│   │   ├── data/
│   │   │   ├── DataTable.tsx              # Generic TanStack Table
│   │   │   ├── SearchBar.tsx              # Debounced — updates URL params
│   │   │   ├── FilterPanel.tsx            # Collapsible — updates URL params
│   │   │   ├── FirmFilter.tsx             # Segmented firm picker — updates ?firmId= in URL
│   │   │   ├── DateRangeFilter.tsx        # From/To date pickers — updates URL params
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── forms/
│   │   │   ├── InputField.tsx             # RHF-integrated text/email/number input
│   │   │   ├── SelectField.tsx            # RHF-integrated searchable combobox + optional "+" button
│   │   │   ├── SwitchField.tsx            # RHF-integrated switch/toggle
│   │   │   ├── DatePickerField.tsx        # Calendar + Popover — never use native date input
│   │   │   ├── OrderedFields.tsx          # Renders fields in a user-customisable order (localStorage)
│   │   │   └── SubmitButton.tsx           # Button with loading spinner
│   │   └── modules/
│   │       ├── PermissionGate.tsx
│   │       ├── SuperAdminGate.tsx
│   │       ├── firms/
│   │       │   └── FirmForm.tsx           # Shared create/edit form for /firms/new and /firms/[id]/edit
│   │       ├── mills/
│   │       │   └── MillForm.tsx
│   │       ├── machines/
│   │       │   └── MachineForm.tsx
│   │       ├── beams/
│   │       │   └── BeamForm.tsx
│   │       ├── beam-qualities/
│   │       │   └── BeamQualityDialog.tsx  # Create/edit dialog — used in list page AND inline from beam form
│   │       ├── production-qualities/
│   │       │   └── ProductionQualityDialog.tsx
│   │       ├── production/
│   │       │   └── ProductionForm.tsx
│   │       ├── mill-info/
│   │       │   ├── MillOutvertForm.tsx
│   │       │   └── MillInvertForm.tsx
│   │       ├── mill-summary/
│   │       │   └── MillSummaryTable.tsx
│   │       ├── machine-info/
│   │       │   └── MachineStatusTable.tsx
│   │       ├── permissions/
│   │       │   └── PermissionMatrix.tsx
│   │       └── auth/
│   │           └── PendingUserCard.tsx
│   ├── lib/
│   │   ├── routes.ts                      # SINGLE SOURCE OF TRUTH for all route paths
│   │   ├── utils.ts                       # shadcn-style cn re-export (kept for shadcn CLI compat)
│   │   ├── api/
│   │   │   ├── client.ts                  # Axios instance — baseURL, interceptors, refresh
│   │   │   ├── request.ts                 # Central typed request helper
│   │   │   ├── auth.ts                    # Auth API — login, refresh, permissions, buildSession, refreshSession
│   │   │   ├── dashboard.ts               # Dashboard stats + production chart endpoints
│   │   │   ├── firms.ts
│   │   │   ├── mills.ts
│   │   │   ├── beamQualities.ts
│   │   │   ├── productionQualities.ts
│   │   │   ├── machines.ts
│   │   │   ├── beams.ts
│   │   │   ├── production.ts
│   │   │   ├── takas.ts
│   │   │   ├── millOutverts.ts
│   │   │   ├── millInverts.ts
│   │   │   ├── machineInfo.ts
│   │   │   ├── millSummary.ts
│   │   │   └── permissions.ts
│   │   ├── actions/                       # Plain client-callable async wrappers (NOT "use server" — except auth)
│   │   │   ├── auth.actions.ts            # "use server" — loginAction, logoutAction, clearSessionCookieAction
│   │   │   ├── firms.actions.ts
│   │   │   ├── mills.actions.ts
│   │   │   ├── beamQualities.actions.ts
│   │   │   ├── productionQualities.actions.ts
│   │   │   ├── machines.actions.ts
│   │   │   ├── beams.actions.ts
│   │   │   ├── production.actions.ts
│   │   │   ├── millOutverts.actions.ts
│   │   │   ├── millInverts.actions.ts
│   │   │   └── permissions.actions.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermission.ts           # hasPermission(module, action)
│   │   │   ├── useDebounce.ts
│   │   │   ├── useQueryParams.ts
│   │   │   ├── useFirms.ts                # Cached firms list + dropdown options
│   │   │   ├── useInfiniteList.ts         # Generic TanStack useInfiniteQuery wrapper for PaginatedResponse
│   │   │   ├── useFieldOrder.ts           # Persists per-form field order to localStorage
│   │   │   └── use-mobile.tsx             # md breakpoint detector
│   │   ├── store/
│   │   │   └── authStore.ts               # Zustand: { user, accessToken, permissions }
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── schemas/                       # Zod schemas for all forms
│   │   │   ├── auth.schema.ts
│   │   │   ├── firm.schema.ts
│   │   │   ├── mill.schema.ts
│   │   │   ├── beamQuality.schema.ts
│   │   │   ├── productionQuality.schema.ts
│   │   │   ├── machine.schema.ts
│   │   │   ├── beam.schema.ts             # uses beamQualityId (FK) not beamQuality (string)
│   │   │   ├── production.schema.ts       # uses productionQualityId (FK) not productionQuality (string)
│   │   │   ├── millOutvert.schema.ts
│   │   │   ├── millInvert.schema.ts
│   │   │   └── permission.schema.ts
│   │   └── utils/
│   │       ├── formatDate.ts
│   │       ├── formatDecimal.ts
│   │       ├── cn.ts                      # clsx + tailwind-merge
│   │       └── handleError.ts
│   ├── types/
│   │   ├── api.d.ts                       # OPTIONAL — generated via `npm run generate:types`, reference only, git-ignored
│   │   └── app.ts                         # Manual shared types: domain entities used across multiple modules
│   └── middleware.ts                      # Server-side auth guard + role redirect
├── scripts/
│   └── generate-types.mjs                 # Hits OpenAPI JSON, writes src/types/api.d.ts
├── public/
│   └── logo.svg
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

> No `tests/` directory or `playwright.config.ts` is checked in yet. `@playwright/test`
> is installed as a dev dependency — when adding E2E coverage, scaffold the config and
> a `tests/e2e/` folder before writing specs.

---

## 4. Central Routes (`src/lib/routes.ts`)

All route paths live in one file. Import from `@/lib/routes` everywhere — never write raw path strings inline.

```typescript
// src/lib/routes.ts

export const ROUTES = {
  // Home (group landing inside (dashboard))
  HOME: "/",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Admin — super_admin only
  ADMIN: {
    PENDING_USERS: "/admin/pending-users",
    USERS: "/admin/users",
    PERMISSIONS: (userId: string) => `/admin/permissions/${userId}`,
  },

  // Firms
  FIRMS: {
    LIST: "/firms",
    NEW: "/firms/new",
    DETAIL: (id: string) => `/firms/${id}`,
    EDIT: (id: string) => `/firms/${id}/edit`,
  },

  // Mills
  MILLS: {
    LIST: "/mills",
    NEW: "/mills/new",
    DETAIL: (id: string) => `/mills/${id}`,
    EDIT: (id: string) => `/mills/${id}/edit`,
  },

  // Beam Qualities — dialog only, no new/edit sub-pages
  BEAM_QUALITIES: {
    LIST: "/beam-qualities",
  },

  // Production Qualities — dialog only, no new/edit sub-pages
  PRODUCTION_QUALITIES: {
    LIST: "/production-qualities",
  },

  // Machines
  MACHINES: {
    LIST: "/machines",
    NEW: "/machines/new",
    DETAIL: (id: string) => `/machines/${id}`,
    EDIT: (id: string) => `/machines/${id}/edit`,
  },

  // Beams
  BEAMS: {
    LIST: "/beams",
    NEW: "/beams/new",
    DETAIL: (id: string) => `/beams/${id}`,
    EDIT: (id: string) => `/beams/${id}/edit`,
  },

  // Production Info
  PRODUCTION: {
    LIST: "/production",
    NEW: "/production/new",
    DETAIL: (id: string) => `/production/${id}`,
    EDIT: (id: string) => `/production/${id}/edit`,
  },

  // Taka — view only
  TAKAS: {
    LIST: "/takas",
    DETAIL: (id: string) => `/takas/${id}`,
  },

  // Mill Outverts
  MILL_OUTVERTS: {
    LIST: "/mill-outverts",
    NEW: "/mill-outverts/new",
    DETAIL: (id: string) => `/mill-outverts/${id}`,
    EDIT: (id: string) => `/mill-outverts/${id}/edit`,
  },

  // Mill Inverts
  MILL_INVERTS: {
    LIST: "/mill-inverts",
    NEW: "/mill-inverts/new",
    DETAIL: (id: string) => `/mill-inverts/${id}`,
    EDIT: (id: string) => `/mill-inverts/${id}/edit`,
  },

  // Machine Info — view only
  MACHINE_INFO: "/machine-info",

  // Mill Summary — view only
  MILL_SUMMARY: "/mill-summary",

  // User Profile
  PROFILE: "/profile",
} as const;
```

**Rules:**

- `as const` makes all values readonly — TypeScript catches typos at compile time.
- Static paths are plain strings; dynamic paths with `[id]` are functions.
- `revalidatePath` in Server Actions must also use `ROUTES`.
- `BEAM_QUALITIES` and `PRODUCTION_QUALITIES` have only `LIST` — create/edit are dialogs, not pages.

---

## 5. Environment Variables

```env
# .env.local

NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

# API docs (Swagger) — for developer reference only, not used in code
# http://localhost:4000/api/v1/api-docs/

JWT_ACCESS_SECRET="same-value-as-backend"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 6. shadcn/ui Setup

```bash
npx shadcn@latest init

npx shadcn@latest add accordion alert-dialog alert avatar badge breadcrumb button calendar card chart checkbox collapsible command dialog drawer dropdown-menu form input input-otp label pagination popover progress radio-group scroll-area select separator sheet sidebar skeleton sonner switch table tabs textarea toggle tooltip slider
```

**Rules:**

- Never manually edit `src/components/ui/` — regenerate via CLI.
- All custom components go in `common/`, `layout/`, `data/`, `forms/`, or `modules/`.
- Import from `@/components/ui/` — never from `@radix-ui/*` directly in page code.

---

## 7. Type Strategy

Types come from **two sources**, depending on what the backend OpenAPI spec exposes:

| Source                 | What it covers                                                                      | Where it lives                                |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| Generated (`api.d.ts`) | **Request body shapes** for all POST/PUT endpoints + query/path params              | `src/types/api.d.ts` (git-ignored, generated) |
| Manual                 | **Response/domain types** — the backend spec has `content?: never` on all responses | `src/types/app.ts`                            |

**`src/types/app.ts` is the single import point for all application types.** It imports generated shapes from `api.d.ts` and re-exports them alongside manual types. Application code always imports from `@/types/app`, never directly from `@/types/api`.

```typescript
// src/types/app.ts
import type { paths } from "@/types/api";

// From generated spec — request body shapes
export type PermissionRow =
  paths["/api/v1/permissions/{adminId}"]["put"]["requestBody"]["content"]["application/json"][number];
export type Permission = PermissionRow;

// Manual — response bodies not in OpenAPI spec
export type AuthUser = { ... };
```

**Before dev or build, run:**

```bash
npm run generate:types
```

`prebuild` runs this automatically before `npm run build`. For `npm run dev`, run it once manually after any backend schema change.

**Rules:**

- Always import types from `@/types/app` — never directly from `@/types/api`
- `src/types/api.d.ts` is git-ignored — every developer must generate it locally
- Use `z.infer<typeof schema>` for form input types in `src/lib/schemas/` — never duplicate the schema type manually
- Response/domain types that the spec doesn't define go in `src/types/app.ts` as manual definitions

---

## 8. Central API System

### Axios client (`src/lib/api/client.ts`)

```typescript
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES } from "@/lib/routes";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string = data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        queue.forEach((cb) => cb(newToken));
        queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().clear();
        window.location.href = ROUTES.LOGIN;
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
```

### Central request helper (`src/lib/api/request.ts`)

```typescript
import { apiClient } from "./client";
import { handleApiError } from "@/lib/utils/handleError";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Internal helper — only needed when calling from a server context that has a token
// but no access to the Zustand interceptor (e.g. auth.actions.ts).
// For all client-side calls the Axios interceptor in client.ts handles this automatically.
function authHeader(
  token?: string,
): { headers: { Authorization: string } } | undefined {
  if (token) return { headers: { Authorization: `Bearer ${token}` } };
  return undefined;
}

export async function getList<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<PaginatedResponse<T>> {
  try {
    const res = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return res.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function getOne<T>(url: string, token?: string): Promise<T> {
  try {
    const res = await apiClient.get<ApiResponse<T>>(url, authHeader(token));
    return res.data.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function post<TBody, TResponse>(
  url: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  try {
    const res = await apiClient.post<ApiResponse<TResponse>>(
      url,
      body,
      authHeader(token),
    );
    return res.data.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function put<TBody, TResponse>(
  url: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  try {
    const res = await apiClient.put<ApiResponse<TResponse>>(
      url,
      body,
      authHeader(token),
    );
    return res.data.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function del(url: string, token?: string): Promise<void> {
  try {
    await apiClient.delete(url, authHeader(token));
  } catch (err) {
    throw handleApiError(err);
  }
}
```

### Central error handler (`src/lib/utils/handleError.ts`)

```typescript
import axios from "axios";
import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err) && err.response) {
    const { message, code } = err.response.data as {
      message: string;
      code: string;
    };
    return new ApiError(
      message ?? "Something went wrong",
      code ?? "UNKNOWN",
      err.response.status,
    );
  }
  return new ApiError(
    "Network error. Please check your connection.",
    "NETWORK_ERROR",
    0,
  );
}

export function showErrorToast(err: unknown): void {
  const message =
    err instanceof ApiError
      ? err.message
      : "Something went wrong. Please try again.";
  toast.error(message);
}
```

### Centralized auth API layer (`src/lib/api/auth.ts`)

`src/lib/api/auth.ts` is the single source of truth for **every** auth-related API call.
Server actions, the dashboard layout, the Axios refresh interceptor, and any future
auth flows must consume from here — never call `apiClient` or `getOne`/`post` for
`/auth/*` or `/permissions/{userId}` directly.

The module exposes three layers:

1. **Bare API calls** — one function per endpoint:
   `login`, `register`, `logout`, `forgotPassword`, `resetPassword`, `refresh`,
   `getPermissionsFor`, `getPendingUsers`, `approveUser`, `rejectUser`, `createUser`,
   `deleteUser`.
   Each returns the unwrapped response data (no `{ data: { data: ... } }` plumbing).

2. **Composed flows** — bundle multiple bare calls into a single semantic operation:
   - `buildSession(user, accessToken) → Session` — fetches permissions for `admin`
     users (super_admins skip the call); permission failures are swallowed so the
     user can still navigate without elevated permissions until next refresh.
   - `refreshSession() → Session` — calls `/auth/refresh` then `buildSession`. This
     is what the dashboard layout uses to re-hydrate Zustand on a hard page refresh.

3. **Server-action-only escape hatch** — `loginRaw(email, password)` bypasses the
   `post` helper to expose the `Set-Cookie` response header so `loginAction` can
   forward the `refreshToken` to the browser via Next.js `cookies()`. **Never call
   from client components** — the browser handles cookies automatically and headers
   are not useful there.

```typescript
// Shape returned by /auth/refresh — backend echoes user info alongside the token
export type RefreshResponse = {
  user: AuthUser;
  accessToken: string;
};

// Unit that auth state is hydrated as
export type Session = {
  user: AuthUser;
  accessToken: string;
  permissions: Permission[];
};

export async function buildSession(
  user: AuthUser,
  accessToken: string,
): Promise<Session> {
  let permissions: Permission[] = [];
  if (user.role === "admin") {
    try {
      permissions = await getPermissionsFor(user.id, accessToken);
    } catch {
      // permissions stay empty if the fetch fails
    }
  }
  return { user, accessToken, permissions };
}

export async function refreshSession(): Promise<Session> {
  const { user, accessToken } = await refresh();
  return buildSession(user, accessToken);
}
```

**Rules:**

- All auth flows compose from these helpers — do not write parallel implementations.
- `/auth/refresh` returns `{ user, accessToken }` (no permissions). Permissions are
  fetched separately via `getPermissionsFor` — already wired inside `buildSession`.
- Super-admins skip the permissions fetch entirely; they get `true` from
  `usePermission` regardless of stored permissions.
- The `refresh()` helper does NOT hit the backend directly. It posts to the
  local `/api/auth/refresh` Next.js route handler ([src/app/api/auth/refresh/route.ts](src/app/api/auth/refresh/route.ts)),
  which reads the HttpOnly `refreshToken` cookie via `next/headers` and forwards
  it to the backend as a `Cookie:` header. This is required in production where
  the frontend and backend live on different origins and the browser will not
  send the frontend-domain cookie cross-origin.
- If the backend later adds fields to the refresh response or a `/auth/me`
  endpoint, **only `refresh()` and `refreshSession()` change** — no consumer needs
  to know.

---

## 9. Zustand Auth Store (`src/lib/store/authStore.ts`)

```typescript
import { create } from "zustand";

export type Permission = {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  status: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  permissions: Permission[];
  setAuth: (user: AuthUser, token: string, permissions: Permission[]) => void;
  setToken: (token: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  permissions: [],
  setAuth: (user, accessToken, permissions) =>
    set({ user, accessToken, permissions }),
  setToken: (accessToken) => set({ accessToken }),
  clear: () => set({ user: null, accessToken: null, permissions: [] }),
}));
```

---

## 10. usePermission Hook (`src/lib/hooks/usePermission.ts`)

```typescript
import { useAuthStore } from "@/lib/store/authStore";

type Action = "view" | "create" | "edit" | "delete";
type Module =
  | "dashboard"
  | "firms"
  | "mills"
  | "beam_qualities"
  | "production_qualities"
  | "machines"
  | "beams"
  | "production"
  | "takas"
  | "mill_outverts"
  | "mill_inverts"
  | "machine_info"
  | "mill_summary";

const ACTION_MAP: Record<
  Action,
  "canView" | "canCreate" | "canEdit" | "canDelete"
> = {
  view: "canView",
  create: "canCreate",
  edit: "canEdit",
  delete: "canDelete",
};

export function usePermission(module: Module, action: Action): boolean {
  const { user, permissions } = useAuthStore();
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const perm = permissions.find((p) => p.module === module);
  if (!perm) return false;
  return perm[ACTION_MAP[action]];
}

export function useIsSuperAdmin(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.role === "super_admin";
}
```

---

## 11. PermissionGate Component

```typescript
'use client'
import { usePermission } from '@/lib/hooks/usePermission'
import type { ReactNode } from 'react'

type Props = {
  module: Parameters<typeof usePermission>[0]
  action: Parameters<typeof usePermission>[1]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ module, action, children, fallback = null }: Props) {
  const allowed = usePermission(module, action)
  return allowed ? <>{children}</> : <>{fallback}</>
}
```

---

## 12. Next.js Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/routes";

const PUBLIC_PATHS = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Escape hatch: the client appends ?session=expired when refreshSession()
  // fails and the stale refreshToken cookie could not be deleted. Without it
  // we would ping-pong between /login → /dashboard → /login forever.
  const sessionExpired = req.nextUrl.searchParams.get("session") === "expired";

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const hasToken = req.cookies.has("refreshToken");
    if (hasToken && !sessionExpired)
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
    return NextResponse.next();
  }

  const hasToken = req.cookies.has("refreshToken");
  if (!hasToken) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|logo.svg).*)"],
};
```

---

## 13. Toast Notifications (sonner)

```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
```

Usage:

```typescript
import { toast } from "sonner";
import { showErrorToast } from "@/lib/utils/handleError";

toast.success("Beam created successfully");

try {
  await createBeamAction(data);
  toast.success("Beam created");
} catch (err) {
  showErrorToast(err); // always use this — never toast.error(err) directly
}

toast.promise(createBeamAction(data), {
  loading: "Creating beam...",
  success: "Beam created",
  error: (err) =>
    err instanceof ApiError ? err.message : "Failed to create beam",
});
```

---

## 14. DatePicker Pattern

Always use `DatePickerField` from `src/components/forms/DatePickerField.tsx`.
Never use native `<input type="date">`.

```tsx
"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

type Props = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DatePickerField({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
```

---

## 15. Icons (lucide-react)

```typescript
// CORRECT — named imports only
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  Eye,
  CalendarIcon,
} from "lucide-react";

// WRONG — never do this
import * as Icons from "lucide-react";
```

| Context     | Class     |
| ----------- | --------- |
| Button icon | `size-4`  |
| Nav icon    | `size-5`  |
| Page header | `size-6`  |
| Empty state | `size-12` |

---

## 16. Theme System

Dark mode via `next-themes`. Tailwind `darkMode: 'class'`. Always use semantic classes — never hardcoded colours.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --destructive: 0 84% 60%;
  --ring: 222 47% 11%;
}
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 15%;
  --card-foreground: 210 40% 98%;
  --border: 217 33% 25%;
  --input: 217 33% 25%;
  --primary: 210 40% 98%;
  --primary-foreground: 222 47% 11%;
  --muted: 217 33% 18%;
  --muted-foreground: 215 20% 65%;
  --destructive: 0 63% 50%;
  --ring: 212 26% 83%;
}
```

> If Figma defines additional colour tokens (e.g. status colours for Mill Summary rows),
> add them as CSS variables here and use them via Tailwind. Never hardcode hex values.

---

## 17. Responsive Layout

| Prefix    | Width    | Target  |
| --------- | -------- | ------- |
| (default) | < 768px  | Mobile  |
| `md:`     | ≥ 768px  | iPad    |
| `lg:`     | ≥ 1024px | Desktop |

| Component  | Mobile         | iPad               | Desktop       |
| ---------- | -------------- | ------------------ | ------------- |
| Sidebar    | Hidden         | Icon only (`w-16`) | Full (`w-64`) |
| Navigation | Bottom tab bar | Sidebar            | Sidebar       |
| Forms      | Single column  | Single column      | Two column    |
| Tables     | Stacked cards  | Compact table      | Full table    |

> Always verify responsive behaviour against Figma mobile and desktop frames.

---

## 18. Actions (`src/lib/actions/`)

Domain actions are **plain async functions** — no `"use server"` directive, no
`revalidatePath`. They are thin wrappers over `src/lib/api/request.ts` called
directly from client components. Cache invalidation is handled by
`queryClient.invalidateQueries` in the component after the action resolves.

**Why no `"use server"`:** The `accessToken` lives only in Zustand (in-memory,
client-side). Server Actions run in Node.js where Zustand is empty, so the Axios
request interceptor in `client.ts` has no token to attach — every mutation would
go out unauthenticated. Keeping actions as plain client-callable functions lets the
interceptor attach the token automatically on every request.

```typescript
import { post, put, del } from "@/lib/api/request";
import type { CreateBeamInput } from "@/lib/schemas/beam.schema";

export async function createBeamAction(data: CreateBeamInput) {
  return post("/beams", data);
}

export async function updateBeamAction(
  id: string,
  data: Partial<CreateBeamInput>,
) {
  return put(`/beams/${id}`, data);
}

export async function deleteBeamAction(id: string) {
  return del(`/beams/${id}`);
}
```

Cache invalidation lives in the component:

```typescript
await deleteBeamAction(id);
await queryClient.invalidateQueries({ queryKey: ["beams"] });
```

### Auth server actions (`auth.actions.ts`)

`loginAction` uses `loginRaw` to forward backend `Set-Cookie` headers (the
`refreshToken`) to the browser, then composes the client session via `buildSession`:

```typescript
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginRaw, logout, buildSession } from "@/lib/api/auth";
import { ROUTES } from "@/lib/routes";

export async function loginAction(email: string, password: string) {
  const { data, setCookieHeader } = await loginRaw(email, password);
  if (setCookieHeader?.length) {
    const cookieStore = await cookies();
    for (const cookieStr of setCookieHeader) {
      const { name, value, options } = parseSetCookieHeader(cookieStr);
      cookieStore.set(name, value, options);
    }
  }
  const session = await buildSession(data.user, data.accessToken);
  return { success: true, ...session };
}

export async function logoutAction(): Promise<void> {
  try {
    await logout();
  } catch {
    // proceed with cookie cleanup even if the backend call fails
  }
  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
  redirect(ROUTES.LOGIN);
}

// Silent cookie cleanup with no redirect — called from the dashboard layout
// when refreshSession() fails on hard reload, so the middleware stops sending
// the user back to /dashboard.
export async function clearSessionCookieAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
}
```

**Logout rules:**

- The server action — not the client — owns `refreshToken` cookie deletion.
  The middleware reads that cookie to decide whether a route is public, so any
  client-only `clear()` of Zustand without deleting the cookie leaves the user
  trapped in a redirect loop.
- The backend `/auth/logout` call is best-effort; cookie cleanup proceeds even
  if it fails (network down, token already expired, etc.).
- Header's `handleLogout` calls `clear()` on the Zustand store _and_ awaits
  `logoutAction()` — both are required.

---

## 19. Domain-Specific Business Logic Rules

### Workflow / Setup Order

The sidebar and dashboard should guide users through the correct setup order:

1. Add Firms
2. Add Mills
3. Add Beam Qualities
4. Add Production Qualities
5. Add Machines
6. Add Beams (references Beam Quality)
7. Add Production Info (references Production Quality)
8. Mill Outvert → Mill Invert

### Production Info form

- `Mill Outvert Date`, `Challan No`, `Mill Invert No`, `Mill Challan No`, `Mill Name` are
  **read-only auto-filled fields** — always render as disabled inputs, never editable.
- `Challan No` field is additionally **conditionally hidden/disabled**: shown only when
  the linked firm has `challanEnable = true`.

### Mill Outvert form

- `Taka Sr No` is a **multi-select** — one challan can include multiple Takas.
- `Challan Enable` is a **toggle (SwitchField)** — toggling it off clears `Challan No`
  from all linked Production Info records.
- Taka Sr No values must exist in Production Info — validate against the API.

### Mill Invert form

- `Challan No` is a **dropdown** referencing existing Outvert Challan Nos — not free text.
- `Taka Sr No` multi-select shows only Taka Sr Nos from the selected Outvert Challan.

### Profile module (`/profile`)

- Accessible to all authenticated users (no permission gate needed).
- Displays user info: name, email, role badge.
- **Reset Password** button triggers a confirmation dialog that calls `forgotPassword(email)` from `src/lib/api/auth.ts` and shows a sonner success toast.
- Header avatar dropdown has a "User Details" item that navigates to `ROUTES.PROFILE` — no inline name/email/role in the dropdown.
- The `PROFILE` route must be added to `ROUTES` (it is) — never hardcode `"/profile"`.

### Taka module

- **View only** — no create, edit, or delete UI at all.
- Navigating to `/takas/new` should redirect to `/takas`.

### Machine Info module

- **View only** — live read from Production Info.
- Auto-refreshes every 30 seconds via `setInterval(() => refetch(), 30000)` in a `useEffect`. Also has a manual **Refresh** button that calls `queryClient.invalidateQueries({ queryKey: ["machine-info"] })`.
- The machine_no filter input uses **debounced local state** (300 ms via `useRef<ReturnType<typeof setTimeout>>`) — the input value is held in `useState`, and URL params are written only after the debounce fires. Use this same pattern for any free-text filter that would fire a URL push on every keystroke.

### Mill Summary View

- **View only** — rows colour-coded by status:
  - Not sent (no Outvert Date): neutral/grey
  - At mill (Outvert Date set, no Invert Date): warning/amber
  - Returned (both dates set): success/green
- Filter tabs: All / At Mill / Returned / Not Sent (verify tab names in Figma).

### Firm-scoped data

- Machine No dropdown in Production Info must only show machines belonging to the selected firm.
- Machine No is unique per firm — two firms can share the same Machine No.

### Delete rules (mirror backend)

- BeamQuality delete: blocked if beams reference it → show toast "Cannot delete — beams are using this quality"
- ProductionQuality delete: blocked if production records reference it → show toast
- Beam delete: blocked if Production Info references it → show toast
- Machine delete: blocked if Production Info references it → show toast
- Firm delete: blocked if Beams, Machines, or Production Info exist → show toast
- Mill delete: blocked if Mill Outvert/Invert records reference it → show toast
- Prefer "Set Inactive" over delete in all cases — match Figma for inactive toggle UI.

### Users module (`/admin/users`) — super_admin only

- **Delete user** — `super_admin` can delete any `admin` user via `DELETE /auth/users/:id`.
- Delete button is **disabled** for rows where `role === "super_admin"` (a super admin cannot delete another super admin, same guard as the Permissions button).
- Uses `ConfirmDialog` (common component); description includes the user's name and email so the actor knows exactly who they are removing.
- On success: `toast.success`, invalidate `["users"]` query. On failure: `showErrorToast`.
- The delete API call lives in `src/lib/api/auth.ts` as `deleteUser(id)` — never call `del()` from the page directly.

---

## 20. Protected Routes — Full Strategy

**Layer 1 — middleware.ts:** checks `refreshToken` cookie, redirects to `ROUTES.LOGIN` if missing.

**Layer 2 — `(dashboard)/layout.tsx`:** on hard refresh, Zustand is empty — calls
`refreshSession()` from `src/lib/api/auth.ts` to restore the full session
(user + token + permissions) in a single helper. Shows skeleton while re-hydrating.
The `.catch` branch sets `isHydrating = false` _before_ redirecting so the skeleton
never sticks if the redirect is slow. A `cancelled` flag in cleanup avoids
setting state on instances unmounted by React Strict Mode in dev. On failure it
also calls `clearSessionCookieAction()` so the stale cookie is gone, and falls
back to `?session=expired` on `/login` as an escape hatch in case the cookie
delete fails — the middleware honours that flag to break any redirect loop.

```typescript
useEffect(() => {
  let cancelled = false;
  const { user, setAuth } = useAuthStore.getState();
  if (user) {
    setIsHydrating(false);
    return;
  }

  refreshSession()
    .then((session) => {
      if (cancelled) return;
      setAuth(session.user, session.accessToken, session.permissions);
      setIsHydrating(false);
    })
    .catch(async () => {
      if (cancelled) return;
      setIsHydrating(false);
      try {
        await clearSessionCookieAction();
      } catch {
        // ignore — ?session=expired below is the second line of defense
      }
      window.location.replace(`${ROUTES.LOGIN}?session=expired`);
    });

  return () => {
    cancelled = true;
  };
}, []);
```

**Layer 3 — `PermissionGate` + `SuperAdminGate`:** per-button and per-page permission checks.

```tsx
export default function BeamsPage() {
  return (
    <PermissionGate module="beams" action="view" fallback={<NoAccessPage />}>
      <PageHeader title="Beams">
        <PermissionGate module="beams" action="create">
          <Button href={ROUTES.BEAMS.NEW}>
            <Plus className="size-4 mr-2" />
            Add Beam
          </Button>
        </PermissionGate>
      </PageHeader>
      <BeamsList />
    </PermissionGate>
  );
}
```

---

## 21. Key Packages

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "next-themes": "latest",
    "lucide-react": "^0.475.0",
    "sonner": "2.0.7",
    "zustand": "5.x",
    "@tanstack/react-query": "5.x",
    "@tanstack/react-table": "8.x",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "3.x",
    "axios": "1.15.2",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest",
    "react-day-picker": "9.14.0",
    "date-fns": "4.x",
    "recharts": "^2.15.4",
    "cmdk": "1.1.1",
    "vaul": "1.1.2",
    "input-otp": "1.4.2",
    "@radix-ui/react-collapsible": "^1.1.12"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "openapi-typescript": "latest",
    "@types/node": "latest",
    "@types/react": "19.x",
    "@types/react-dom": "19.x",
    "shadcn": "^4.6.0"
  },
  "overrides": {
    "react-is": "^19.0.0"
  }
}
```

> **`overrides` note:** recharts 2.x has a peer dep on `react-is` from React 18.
> The override forces React 19's version — required when using recharts with React 19.

---

## 22. Playwright Test Strategy

> Status: `@playwright/test` is installed as a dev dependency, but no
> `tests/e2e/` folder or `playwright.config.ts` is checked in yet. Before
> writing the first spec, scaffold `playwright.config.ts` and `tests/e2e/`
> in the repo root.

Conventions when E2E coverage is added:

- Import paths from `@/lib/routes` — never hardcode strings.
- Cover at minimum: auth (login / register / forgot-password), permission gating
  (admin without `delete` should not see delete buttons), and the full mill
  flow (firm → mill → beam quality → beam → production → outvert → invert →
  summary status transitions).

```typescript
// tests/e2e/beams.spec.ts (sample)
import { test, expect } from "@playwright/test";
import { ROUTES } from "@/lib/routes";

test.describe("Beams — admin with view+create only", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.fill("[name=email]", "admin@example.com");
    await page.fill("[name=password]", "Test@1234");
    await page.click("[type=submit]");
    await page.waitForURL(ROUTES.DASHBOARD);
  });

  test("Delete button not visible without delete permission", async ({
    page,
  }) => {
    await page.goto(ROUTES.BEAMS.LIST);
    await expect(
      page.getByRole("button", { name: "Delete" }),
    ).not.toBeVisible();
  });
});
```

---

## 23. Common Component Rules

### Form Fields (`src/components/forms/`)

ALL form fields across every module must use these common components.
Never build inline label+input+error patterns inside module forms or pages.

| Component         | Use for                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `InputField`      | All text, email, password, number, tel inputs                    |
| `SelectField`     | All dropdowns — supports search + optional inline "+" create btn |
| `SwitchField`     | All boolean toggles (status, challanEnable, etc.)                |
| `DatePickerField` | All date inputs — never use native date input                    |
| `OrderedFields`   | Renders a form's fields in a user-customisable order             |
| `SubmitButton`    | All form submit buttons with loading state                       |

### Field Ordering (OrderedFields + FieldOrderButton + useFieldOrder)

All multi-field create/edit forms (FirmForm, MillForm, MachineForm, BeamForm,
ProductionForm, MillOutvertForm, MillInvertForm) wrap their inputs in
`OrderedFields`, which:

- Persists the user's chosen order per `formId` to `localStorage` via
  `useFieldOrder` (`form:order:<formId>` key).
- Reconciles saved order against the current `fields` array on mount, so newly
  added fields appear at the end and deleted fields are dropped.
- Portals a `FieldOrderButton` ("Order" dropdown with up/down arrows) into the
  `PageHeader` via the stable DOM id `HEADER_ACTIONS_SLOT_ID` exported from
  [src/components/layout/PageHeader.tsx](src/components/layout/PageHeader.tsx).
- Supports a `gridCols` prop (2 or 3) and a per-field `fullWidth` flag.
- Accepts `allFieldIds` (a superset of currently-rendered ids) so that
  conditionally hidden fields keep their slot when they re-appear.

**Rules:**

- Every multi-field form on a `/new` or `/edit` page must use `OrderedFields`.
- Pages that host such a form must render `<PageHeader />` — the field-order
  button portals into its actions slot. Without it, the button silently
  disappears.
- The `formId` must be unique and stable per form (e.g. `"firm-form"`,
  `"production-form"`), or saved orders will collide across forms.

### SelectField — Inline Create Pattern

When a Select field references a master list (BeamQuality, ProductionQuality, Machine, etc.)
and the user may need to create a new option without leaving the current form:

- Pass `onAddNew` prop to `SelectField`
- This renders a "+" icon button beside the select trigger (Plus icon, size-4, outline variant)
- Clicking "+" opens the relevant Dialog (BeamQualityDialog, ProductionQualityDialog, etc.)
- After successful create: invalidate the options query so the new item appears, then auto-select it
- The dialog component must be importable standalone — not embedded inside the list page component

### Dialogs (`src/components/common/`)

| Component       | Use for                                       |
| --------------- | --------------------------------------------- |
| `FormDialog`    | ALL create and edit operations across modules |
| `ConfirmDialog` | ALL delete confirmations across modules       |

Never build one-off dialog implementations inside module pages.
`FormDialog` wraps the form content — the form itself lives in the module's dialog component.

### Quality Modules (BeamQuality, ProductionQuality)

- No separate new/edit pages — all CRUD is via dialogs on the list page
- `BeamQualityDialog` and `ProductionQualityDialog` are standalone components in `src/components/modules/`
- Each dialog handles both create mode (no `id` prop) and edit mode (`id` prop passed)
- These dialog components are imported both from the list page AND inline from Beam/Production forms

### DataTable (`src/components/data/DataTable.tsx`)

- One generic DataTable component used across ALL list pages
- Supports: sorting, pagination, column visibility toggle, loading skeleton rows
- Never build a one-off table per module — always use DataTable with column definitions passed as props

### SearchBar (`src/components/data/SearchBar.tsx`)

- Debounced input (300ms) — updates URL search params on change
- Used on every list page that supports `?search=` query param
- Never build inline search inputs per module

### FilterPanel (`src/components/data/FilterPanel.tsx`)

- Collapsible panel — updates URL search params when filter values change
- Used for: status filter, date range filter, firmId filter, qualityId filter
- Never build inline filter UI per module

### FirmFilter (`src/components/data/FirmFilter.tsx`)

- Segmented pill-style firm picker. Renders `All` + one button per firm.
- Reads/writes `?firmId=` on the URL via `useSearchParams` + `router.push`.
- Always pair with `useFirms()` for the `options` and `isLoading` props.
- Used on the dashboard and any list page that needs to scope data to a firm.

### DateRangeFilter (`src/components/data/DateRangeFilter.tsx`)

- Two `DatePickerField`-style inputs (from / to) that write `?fromDate=` and
  `?toDate=` to the URL. Use on list pages that support date-range filtering.

### Lazy-loaded filter dropdowns (Mill / Quality select inside FilterPanel)

For select dropdowns in `FilterPanel` that reference a master list (mills, production
qualities, etc.), **do not derive options from the currently-loaded page items** —
that only surfaces options already on screen and misses the rest of the master list.

The correct pattern:

```tsx
const [selectOpen, setSelectOpen] = useState(false);

const { data, isLoading } = useQuery({
  queryKey: ["mills", "filter-list"],
  queryFn: () => getMills({ status: "active", limit: 200 }),
  enabled: selectOpen,          // lazy — only fetches when the user opens the dropdown
  staleTime: 5 * 60 * 1000,    // 5 min — master list changes rarely
});

<Select open={selectOpen} onOpenChange={setSelectOpen} ...>
  <SelectContent>
    <SelectItem value="all">All Mills</SelectItem>
    {isLoading ? (
      <>
        <Skeleton className="mx-2 my-1 h-5 w-36" />
        <Skeleton className="mx-2 my-1 h-5 w-28" />
        <Skeleton className="mx-2 my-1 h-5 w-32" />
      </>
    ) : (
      options.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)
    )}
  </SelectContent>
</Select>
```

URL param name for mill filter is `?mill=` (mapped to `millId` when passed to the fetcher).
URL param name for quality filter is `?qualityId=`.

### MillStatusBadge (`src/components/common/MillStatusBadge.tsx`)

- Single source of truth for the Not Sent / At Mill / Returned status pill.
- Takes `millOutvertDate` and `millInvertId`. Never inline this logic in tables.

---

## 24. What NOT to Do

- Do NOT install any icon library other than `lucide-react`
- Do NOT install any toast/notification library other than `sonner`
- Do NOT install any UI library other than `shadcn/ui`
- Do NOT use `any` type in TypeScript
- Do NOT call `apiClient` directly from components, layouts, or actions — use `src/lib/api/request.ts` for generic CRUD and `src/lib/api/auth.ts` for any auth flow
- Do NOT add `"use server"` to domain action files (`firms.actions.ts`, `mills.actions.ts`, etc.) — actions must run client-side so the Axios interceptor can attach the `accessToken` from Zustand. Only `auth.actions.ts` uses `"use server"` (it needs `cookies()` to set the `refreshToken`)
- Do NOT use `revalidatePath` in domain actions — use `queryClient.invalidateQueries` in the component after the action resolves
- Do NOT duplicate auth flows (login, refresh, logout, permissions fetch) — every consumer composes from `src/lib/api/auth.ts`. New auth-related calls land there too
- Do NOT call `/auth/refresh` directly from a layout or component — call `refreshSession()` so the user + permissions are rebuilt as a single `Session`
- Do NOT delete the `refreshToken` cookie from client code — `logoutAction` owns it. Client code only calls `useAuthStore.getState().clear()` and awaits `logoutAction()`
- Do NOT store `accessToken` in localStorage — Zustand memory only
- Do NOT hardcode colour values — use semantic CSS variables via Tailwind classes
- Do NOT skip `PermissionGate` on any action button or write operation
- Do NOT use `toast.error(err)` directly — always use `showErrorToast(err)`
- Do NOT create a second Axios instance
- Do NOT use `useEffect` to fetch data — use TanStack Query or Server Components
- Do NOT import directly from `src/types/api.d.ts` — always go through `src/types/app.ts`
- Do NOT edit `src/types/api.d.ts` — it is auto-generated; run `npm run generate:types` to regenerate it
- Do NOT edit files in `src/components/ui/` manually
- Do NOT use native `<input type="date">` — always use `DatePickerField`
- Do NOT hardcode route strings — always import from `@/lib/routes` and use `ROUTES`
- Do NOT call `/api/auth/refresh` or the backend `/auth/refresh` directly — always go through `refresh()` / `refreshSession()` in [src/lib/api/auth.ts](src/lib/api/auth.ts). The local Next.js route handler must remain the only direct caller of the backend refresh endpoint.
- Do NOT build a multi-field create/edit form without `OrderedFields` and a `PageHeader` — the field-order button silently disappears if `HEADER_ACTIONS_SLOT_ID` is not in the DOM.
- Do NOT hand-roll the Not Sent / At Mill / Returned status pill — use `MillStatusBadge`.
- Do NOT derive filter dropdown options from the current page's loaded items — use a lazy `useQuery` against the master-list endpoint so all options are available, not just those on screen.
- Do NOT write URL params on every keystroke from a free-text filter input — use debounced local state (300 ms, same pattern as `SearchBar`) to batch URL writes.
- Do NOT put user name/email/role in the Header dropdown — those belong on the `/profile` page. The dropdown contains only "User Details" (→ `ROUTES.PROFILE`) and "Logout".
- Do NOT build UI without checking the corresponding Figma frame first
- Do NOT assume API request/response shapes — always verify against Swagger
- Do NOT make `Taka`, `Machine Info`, or `Mill Summary` editable — view-only
- Do NOT allow Mill-related fields in Production Info to be edited — auto-filled only
- Do NOT build one-off table, search, filter, or dialog components per module — use common components
- Do NOT add `NEW`, `DETAIL`, or `EDIT` routes for `BEAM_QUALITIES` or `PRODUCTION_QUALITIES` — dialog only
- Do NOT use `beamQuality` (string) in beam schema — use `beamQualityId` (UUID FK)
- Do NOT use `productionQuality` (string) in production schema — use `productionQualityId` (UUID FK)
