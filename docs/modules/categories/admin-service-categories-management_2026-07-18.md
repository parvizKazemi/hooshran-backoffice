# Admin Service Categories Management

---

**Last Updated:** 2026-07-18 11:55

---

## Summary

Added an admin module to manage service catalog categories under **Services → Manage Categories** (`/services/categories`).

Admins can list, create, edit, delete, and drag-and-drop reorder categories. Each category stores `name`, `slug`, `order`, and `badge` (`soon` | `new` | `null`).

API calls are currently mocked (`USE_MOCK_CATEGORIES = true`). Paths live in a single endpoints file so the real backend can be wired without rewriting UI.

---

## Problem

- Category management UI did not exist in the services submenu.
- Existing `/categories` page used an outdated model (`description`, `is_active`) and mock-only CRUD without reorder.
- Backend routes were not finalized, so endpoint paths needed to be easy to change later.

---

## Solution

- Rebuilt `features/categories` around the Sprint-05 HTML mock (categories only; services management out of scope).
- Separated concerns: `endpoints.ts`, `service.ts`, React Query hooks, UI components.
- Local DnD reorder with explicit save/cancel; create/update/delete hit the API (or mock) immediately.
- Toggle mock vs real API via `USE_MOCK_CATEGORIES`.

---

## Scope

- Admin sidebar: Services submenu
- Route: `/services/categories` (legacy `/categories` redirects)
- Categories list / form dialog / delete dialog / reorder save bar
- i18n (`fa` / `en`)

---

## Changes

### Change 1 — Categories manager UI

**Purpose**

Match the admin mock for category CRUD and sidebar ordering.

**Implementation**

Sortable table (`@dnd-kit`), form dialog (name, slug, order, badge), delete confirm, save/cancel for order.

**Result**

Admins can manage categories and preview badge/order behavior before backend is ready.

---

### Change 2 — Configurable API layer

**Purpose**

Allow swapping mock data for real endpoints with minimal code change.

**Implementation**

- `api/endpoints.ts` — path map
- `api/service.ts` — HTTP wrappers + mock branch
- `constants.ts` — `USE_MOCK_CATEGORIES`

**Result**

Backend handoff is two steps: update paths, flip the mock flag.

---

## Components Affected

```text
src/features/categories/Categories.tsx
src/features/categories/types.ts
src/features/categories/constants.ts
src/features/categories/mock-data.ts
src/features/categories/api/endpoints.ts
src/features/categories/api/service.ts
src/features/categories/hooks/use-categories.ts
src/features/categories/components/categories-table.tsx
src/features/categories/components/category-form-dialog.tsx
src/features/categories/components/category-delete-dialog.tsx
src/features/categories/components/category-badge-pill.tsx
src/components/layout/app-sidebar.tsx
src/routes/AppRouter.tsx
src/locales/fa/common.json
src/locales/en/common.json
```

---

## Structure

```text
features/categories/
├── Categories.tsx              # Page: local list state + save/cancel order
├── types.ts                    # Category, form schema, CRUD/reorder payloads
├── constants.ts                # USE_MOCK_CATEGORIES, badge helpers, query key
├── mock-data.ts                # In-memory store used while mock is on
├── api/
│   ├── endpoints.ts            # ← change paths here
│   └── service.ts              # fetch/create/update/delete/reorder
├── hooks/use-categories.ts     # React Query
└── components/
    ├── categories-table.tsx
    ├── category-form-dialog.tsx
    ├── category-delete-dialog.tsx
    └── category-badge-pill.tsx
```

### Domain model

| Field   | Type                      | Notes                          |
| ------- | ------------------------- | ------------------------------ |
| `id`    | `string`                  | Server id / uuid               |
| `name`  | `string`                  | Required                       |
| `slug`  | `string`                  | kebab-case, required           |
| `order` | `number` (positive int)   | Sidebar priority               |
| `badge` | `"soon" \| "new" \| null` | Form uses `"none"` → sent null |

### Expected API contract

| Action  | Method   | Default path                | Body / notes                               |
| ------- | -------- | --------------------------- | ------------------------------------------ |
| List    | `GET`    | `/admin/categories`         | `Category[]` or `{ data: Category[] }`     |
| Create  | `POST`   | `/admin/categories`         | `{ name, slug, order, badge }`             |
| Update  | `PUT`    | `/admin/categories/:id`     | `{ name, slug, order, badge }`             |
| Delete  | `DELETE` | `/admin/categories/:id`     | —                                          |
| Reorder | `PATCH`  | `/admin/categories/reorder` | `{ items: [{ id, order }] }` → sorted list |

---

## User Flow

1. Open **Services → Manage Categories**.
2. View ordered list; drag rows to change local order.
3. Add/edit via dialog; delete via confirm dialog.
4. Click **Save final changes** to persist order, or **Cancel** to reset to last loaded order.

---

## Connecting the real backend

1. **Align paths** in `src/features/categories/api/endpoints.ts` with final backend routes (including `:id` helpers and reorder).
2. **Confirm payload/response shapes** match `Category` / `CreateCategoryInput` / `ReorderCategoriesInput` in `types.ts`.
   - If the API uses `uuid` instead of `id`, map in `api/service.ts` (or rename types to match).
   - If list is always wrapped (`{ data: [...] }`), current service already supports both array and `{ data }`.
3. **Turn off mock**: set `USE_MOCK_CATEGORIES` to `false` in `constants.ts`.
4. **Smoke-test**: list → create → edit → delete → drag reorder → save.
5. Optional: remove or keep `mock-data.ts` for local demos; it is unused when the flag is `false`.

No other UI files need changes if the contract above is met.

---

## Tasks Status

### Completed

- [x] Categories admin page under Services submenu
- [x] CRUD + DnD reorder with save/cancel
- [x] Badge support (`soon` / `new` / null)
- [x] Endpoints file + mock toggle
- [x] i18n (fa/en)
- [x] Production build passes

### Remaining

- [ ] Wire real backend (`USE_MOCK_CATEGORIES = false`)
- [ ] Confirm final path/field names with backend
- [ ] Services management UI (out of scope for this task)

---

## Notes & Examples

**Toggle mock off:**

```ts
// src/features/categories/constants.ts
export const USE_MOCK_CATEGORIES = false;
```

**Example reorder body:**

```json
{
  "items": [
    { "id": "fashion", "order": 1 },
    { "id": "toolbox", "order": 2 }
  ]
}
```

Create/update/delete invalidate React Query key `["categories"]`. Reorder updates the cache via `setQueryData`.

---

## AI Context Tags

```text
module: categories
feature: admin-service-categories-management
project: hooshran-admin
type: feature
ui-change: true
ux-change: true
api-mock: true
backend-handoff: true
responsive-impact: true
```
