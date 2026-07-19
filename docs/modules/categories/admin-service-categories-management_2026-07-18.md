# Admin Service Categories Management

---

**Last Updated:** 2026-07-19 09:15

---

## Summary

Added an admin module to manage service catalog categories under **Services → Manage Categories** (`/services/categories`).

Admins draft add/edit/delete/reorder locally, then persist everything with one **Save final changes** action. Payload is a full `Category[]` array (`uuid`, `name`, `slug`, `order`, `badge`).

API surface is **GET / POST / PATCH** only. Mock mode (`USE_MOCK_CATEGORIES = true`) until backend is ready. Unsaved changes show a banner and block tab close via `beforeunload`.

---

## Problem

- Category management UI did not exist in the services submenu.
- Existing `/categories` page used an outdated model (`description`, `is_active`) and mock-only CRUD without reorder.
- Backend routes were not finalized, so endpoint paths needed to be easy to change later.

---

## Solution

- Rebuilt `features/categories` around the Sprint-05 HTML mock (categories only; services management out of scope).
- All mutations stay in local draft until save; one POST/PATCH sends the full array.
- `uuid` instead of `id`; endpoints file for easy path swaps; unsaved guard for tab close.

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
├── Categories.tsx              # Local draft state; save-all only
├── types.ts                    # Category (uuid), form, CategoryPayload
├── constants.ts                # USE_MOCK_CATEGORIES, badge helpers
├── mock-data.ts                # In-memory store while mock is on
├── utils/category.helpers.ts   # dirty check, payload map, local uuid
├── api/
│   ├── endpoints.ts            # GET list / POST create / PATCH save
│   └── service.ts              # fetchCategories, saveCategories(array)
├── hooks/use-categories.ts
└── components/
    ├── categories-table.tsx
    ├── category-form-dialog.tsx
    ├── category-delete-dialog.tsx
    └── category-badge-pill.tsx
```

### Domain model

| Field     | Type                      | Notes                                      |
| --------- | ------------------------- | ------------------------------------------ |
| `uuid`    | `string`                  | Server uuid; local rows use `local-…` temp |
| `name`    | `string`                  | Required                                   |
| `slug`    | `string`                  | kebab-case, required                       |
| `order`   | `number` (positive int)   | Sidebar priority                           |
| `badge`   | `"soon" \| "new" \| null` | Form `"none"` → sent `null`                |
| `isLocal` | `boolean?`                | Client-only; omitted uuid on save payload  |

### Expected API contract

Only **GET / POST / PATCH**. Bodies are **arrays of objects**.

| Action | Method  | Default path        | Body / response                                            |
| ------ | ------- | ------------------- | ---------------------------------------------------------- |
| List   | `GET`   | `/admin/categories` | `Category[]` or `{ data: Category[] }`                     |
| Create | `POST`  | `/admin/categories` | `CategoryPayload[]` (used when baseline list empty)        |
| Save   | `PATCH` | `/admin/categories` | `CategoryPayload[]` full list sync (add/edit/delete/order) |

`CategoryPayload`:

```ts
{ uuid?: string; name: string; slug: string; order: number; badge: "soon" | "new" | null }
```

- Existing rows: include `uuid`
- New rows: omit `uuid` (`isLocal` on client)
- Deleted rows: absent from the array

---

## User Flow

1. Open **Services → Manage Categories** (GET loads array).
2. Reorder / add / edit / delete — all local draft only.
3. Unsaved banner + browser `beforeunload` while dirty.
4. **Save final changes** → POST (empty baseline) or PATCH (otherwise) with full array.
5. **Cancel** resets draft to last saved baseline.

---

## Connecting the real backend

1. Align paths in `api/endpoints.ts` (`list` / `create` / `save`).
2. Confirm array request/response with `uuid` (not `id`).
3. Set `USE_MOCK_CATEGORIES = false` in `constants.ts`.
4. Smoke-test: load → edit+reorder+add+delete → save once → reload.

---

## Tasks Status

### Completed

- [x] Categories admin page under Services submenu
- [x] Draft CRUD + DnD; single save for full array
- [x] Unsaved banner + tab close guard
- [x] `uuid` field; GET/POST/PATCH only
- [x] Badge support (`soon` / `new` / null)
- [x] Endpoints file + mock toggle
- [x] i18n (fa/en)

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

**Example PATCH/POST body:**

```json
[
  {
    "uuid": "11111111-1111-4111-8111-111111111105",
    "name": "مد و فشن",
    "slug": "fashion",
    "order": 1,
    "badge": null
  },
  { "name": "دسته جدید", "slug": "new-cat", "order": 2, "badge": "new" }
]
```

Save updates React Query cache via `setQueryData(["categories"], data)`.

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
batch-save: true
backend-handoff: true
responsive-impact: true
```
