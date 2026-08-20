# Admin Affiliate Management UI (Mock-First)

---

**Last Updated:** 2026-08-17 13:04

---

## Summary

A new admin module at `/affiliate` implements the **Affiliate / Partner Sales management** panel based on the Sprint-06 Admin HTML design.

The page is **UI-complete but backend-disconnected**: KPI stats, payout requests, partner directory, commission audit log, and program rules use placeholder data stored in an in-memory mock store. Mutations (approve/reject payout, suspend/activate partner, save rules) update the mock store and refresh React Query cache.

Admins reach the page from **Sidebar → مدیریت افیلیت** (`nav.affiliate`).

This mirrors the frontend affiliate approach: stable types, placeholder endpoints, and a mapper ready for backend handoff with minimal UI changes.

---

## Problem

- No admin UI existed for affiliate operations (PAYA payouts, partner access control, commission audit, program rules).
- Backend admin affiliate endpoints were not ready.
- Product needed a production-ready admin shell matching the HTML mock, with i18n and tabbed workflow, that can switch to real APIs later without refactoring components.

---

## Solution

- **Feature module:** `src/features/affiliate/` following existing admin patterns (monitoring, referrals, categories).
- **Page shell:** `Affiliate.tsx` orchestrates stats, tabs, and dialogs.
- **Modular UI:** separate components per tab (payouts, partners, commissions, rules) + approve/reject dialogs.
- **Domain layer:** `types.ts`, `constants.ts`, `mock-data.ts`, `utils/affiliate.helpers.ts`.
- **Mock data path:** `useAffiliateAdminDashboard()` → `fetchAffiliateAdminDashboard()` reads from in-memory `mockStore`.
- **Mutation path:** TanStack Query mutations call mock service functions and `setQueryData` on success.
- **API-ready path (prepared, not wired):** `api/endpoints.ts` + commented `apiGet`/`apiPost`/`apiPut` stubs + `mapAffiliateAdminDashboard()` with field aliases.

---

## Scope

- Admin route `/affiliate`
- Sidebar navigation entry
- KPI summary cards
- Tabbed management: payouts, partners, commissions, rules
- Approve / reject payout modals
- i18n keys (`fa` / `en`) under `affiliate.*`
- Mock in-memory store with session-persistent mutations

**Out of scope (by design):**

- Real API integration
- Server-side pagination / filtering for tables
- Permission/role guard specific to affiliate module
- Linking to existing `/referrals` page (legacy referral rewards — separate module)

---

## Changes

### Change 1 — Affiliate admin page and routing

**Purpose**

Expose the affiliate management panel in the admin app.

**Implementation**

- `src/routes/AppRouter.tsx` — lazy route `/affiliate` → `Affiliate.tsx`.
- `src/components/layout/app-sidebar.tsx` — nav item + `completedItems` entry.
- `Affiliate.tsx` — page header, anti-fraud badge, info banner, stats, tabs, dialog state.

**Result**

Authenticated admins see the full affiliate panel inside the standard admin layout (sidebar + header).

---

### Change 2 — KPI stats cards

**Purpose**

Display top-level affiliate metrics from the HTML design.

**Implementation**

- `components/affiliate-stats-cards.tsx` — 4 cards:
  - Pending payout amount + count hint
  - Total paid commissions
  - Affiliate-attributed sales
  - Active partners + marketers-with-sales-this-month hint
- `deriveAffiliateStats()` recalculates pending amount/count from payout list.

**Result**

Pending payout badge on the Payouts tab stays in sync when payouts are approved/rejected.

---

### Change 3 — Tabbed management sections

**Purpose**

Organize admin workflows into four areas from the HTML mock.

**Implementation**

| Tab         | Component                         | Features                                                             |
| ----------- | --------------------------------- | -------------------------------------------------------------------- |
| Payouts     | `affiliate-payouts-table.tsx`     | Status filter, SHEBA display, identity match, approve/reject actions |
| Partners    | `affiliate-partners-table.tsx`    | Search by name/code, suspend/activate toggle                         |
| Commissions | `affiliate-commissions-table.tsx` | Audit log with purchase type, cap indicator, release status          |
| Rules       | `affiliate-rules-form.tsx`        | 6 program parameters, save button                                    |

Uses shadcn `Tabs`, `Table`, `Select`, `Badge`, `Dialog`.

**Result**

Full admin workflow is navigable and interactive with mock data.

---

### Change 4 — Payout approve / reject modals

**Purpose**

Match PAYA approval and rejection flows from the HTML prototype.

**Implementation**

- `approve-payout-dialog.tsx` — amount + SHEBA summary, PAYA tracking code input.
- `reject-payout-dialog.tsx` — predefined rejection reasons from `AFFILIATE_REJECT_REASONS`.
- Hooks: `useApproveAffiliatePayout()`, `useRejectAffiliatePayout()`.

**Result**

Admin can approve (with tracking code) or reject payouts; table and stats update immediately via query cache.

---

### Change 5 — Mock service layer and API stubs

**Purpose**

Allow backend connection with minimal file changes when endpoints go live.

**Implementation**

- `mock-data.ts` — `AFFILIATE_ADMIN_INITIAL_DASHBOARD` (sample payouts, partners, commissions, rules).
- `api/service.ts` — module-level `mockStore` + mutation functions.
- `api/endpoints.ts` — placeholder paths under `/admin/affiliate/*`.
- `mapAffiliateAdminDashboard()` — normalizes backend payload + alias map in `PROGRAM_RULE_ALIASES`.

**Result**

Frontend contract is defined; only the service layer and mapper fallbacks need updating when backend ships.

---

## Components Affected

```text
src/features/affiliate/Affiliate.tsx
src/features/affiliate/types.ts
src/features/affiliate/constants.ts
src/features/affiliate/mock-data.ts
src/features/affiliate/api/endpoints.ts
src/features/affiliate/api/service.ts
src/features/affiliate/hooks/use-affiliate-admin.ts
src/features/affiliate/utils/affiliate.helpers.ts
src/features/affiliate/components/affiliate-stats-cards.tsx
src/features/affiliate/components/affiliate-payouts-table.tsx
src/features/affiliate/components/affiliate-partners-table.tsx
src/features/affiliate/components/affiliate-commissions-table.tsx
src/features/affiliate/components/affiliate-rules-form.tsx
src/features/affiliate/components/approve-payout-dialog.tsx
src/features/affiliate/components/reject-payout-dialog.tsx
src/routes/AppRouter.tsx
src/components/layout/app-sidebar.tsx
src/locales/fa/common.json
src/locales/en/common.json
```

---

## User Flow

1. Admin opens **Sidebar → مدیریت افیلیت** (`/affiliate`).
2. KPI cards show pending payouts, total paid, affiliate sales, active partners.
3. **Payouts tab (default):**
   - Filter by status (default: pending).
   - Approve → enter PAYA tracking code → payout marked paid.
   - Reject → select reason → payout marked rejected.
4. **Partners tab:**
   - Search by name or promo code.
   - Suspend or activate partner access.
5. **Commissions tab:**
   - Browse invoice-level commission audit log.
6. **Rules tab:**
   - Edit program parameters → Save → toast success (mock persistence).

---

## Tasks Status

### Completed

- [x] Created `/affiliate` route with lazy loading
- [x] Added sidebar nav + i18n (`fa` / `en`)
- [x] Implemented 4 KPI stat cards
- [x] Implemented 4 tabs: payouts, partners, commissions, rules
- [x] Approve / reject payout modals with toast feedback
- [x] Partner search + status toggle
- [x] Commission audit table with cap and release badges
- [x] Program rules form (6 fields)
- [x] In-memory mock store with mutation support
- [x] TanStack Query hooks + cache updates on mutation
- [x] Domain types, constants, helpers, endpoint placeholders
- [x] `mapAffiliateAdminDashboard()` with field alias support

### Remaining

#### 1. Wire dashboard API

- [ ] Replace stub in `api/service.ts`:

```ts
export async function fetchAffiliateAdminDashboard() {
  const raw = await apiGet(AFFILIATE_ADMIN_ENDPOINTS.dashboard);
  return mapAffiliateAdminDashboard(raw, AFFILIATE_ADMIN_INITIAL_DASHBOARD);
}
```

- [ ] Confirm final endpoint paths with backend (`AFFILIATE_ADMIN_ENDPOINTS` may change).
- [ ] Align response shape with `AffiliateAdminDashboard` or extend `PROGRAM_RULE_ALIASES` / normalizers.
- [ ] Decide money unit from API (Toman vs Rial) and normalize in mapper if needed.

#### 2. Wire mutation APIs

- [ ] `approveAffiliatePayout` → `apiPost` to `approvePayout(id)` with `{ payaTrackingCode }`.
- [ ] `rejectAffiliatePayout` → `apiPost` to `rejectPayout(id)` with `{ reason }`.
- [ ] `toggleAffiliatePartnerStatus` → `apiPost` to `togglePartner(id)`.
- [ ] `saveAffiliateProgramRules` → `apiPut` to `rules` endpoint.
- [ ] After each mutation: prefer `invalidateQueries([AFFILIATE_ADMIN_QUERY_KEY])` or use API response via `mapAffiliateAdminDashboard`.
- [ ] Add error handling via `ApiError` + `toast.error` (pattern from `use-monitoring.ts`).

#### 3. Remove mock / placeholder data (cleanup checklist)

When backend is live, **delete or stop using**:

| Item                                       | Location                                              | Action                                   |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------------- |
| Initial mock dashboard object              | `AFFILIATE_ADMIN_INITIAL_DASHBOARD` in `mock-data.ts` | Remove file or keep only as test fixture |
| In-memory `mockStore`                      | `api/service.ts`                                      | Remove entirely                          |
| Mock mutation logic                        | `api/service.ts`                                      | Replace with real HTTP calls             |
| Static sample payouts/partners/commissions | `mock-data.ts`                                        | Remove from runtime path                 |
| `AFFILIATE_DEFAULT_RULES` as primary data  | `constants.ts`                                        | Keep only as mapper fallback defaults    |
| Commented API stubs                        | `api/service.ts`                                      | Uncomment and wire                       |

**Mapper fallback behavior to review after cleanup:**

- `mapAffiliateAdminDashboard()` currently falls back to `AFFILIATE_ADMIN_INITIAL_DASHBOARD` sections when API omits data.
- After go-live, prefer empty defaults (`[]` lists, `0` counts) instead of sample rows.

#### 4. Table enhancements

- [ ] Server-side pagination for payouts, partners, commissions (follow `referrals-table.tsx` / monitoring patterns).
- [ ] Server-side status filter and search for partners tab.
- [ ] Loading skeletons during refetch (partially implemented).
- [ ] Empty states already exist; verify copy with product.

#### 5. Cross-app alignment with frontend affiliate

- [ ] Align program rule field names between admin (`AffiliateProgramRules`) and user dashboard (`AffiliateProgramRates` in hooshran-front).
- [ ] Align commission cap, hold days, min payout values once backend is single source of truth.
- [ ] Map admin `renewalSunsetDays` (180) vs frontend `renewalMonths` (6) — confirm backend canonical unit.

#### 6. Admin integration polish

- [ ] Add role/permission guard if affiliate admin should be restricted.
- [ ] Add link from partner row to user profile (if user UUID available from API).
- [ ] Move rejection reasons to i18n or backend-provided list when API is ready.
- [ ] Add tests for `mapAffiliateAdminDashboard()` and `deriveAffiliateStats()` once API contract is frozen.

---

## Notes & Examples

### Placeholder admin endpoints

```ts
/admin/affiliate/dashboard
/admin/affiliate/payouts
/admin/affiliate/payouts/:id/approve
/admin/affiliate/payouts/:id/reject
/admin/affiliate/partners
/admin/affiliate/partners/:id/toggle-status
/admin/affiliate/commissions
/admin/affiliate/rules
```

### Expected dashboard payload shape (target)

```ts
{
  stats: {
    pendingPayoutAmount: number,
    pendingPayoutCount: number,
    pendingPayoutHint?: string,
    totalPaidCommissions: number,
    affiliateGeneratedSales: number,
    activePartnersCount: number,
    marketersWithSalesThisMonth: number,
  },
  payouts: AffiliatePayoutRequest[],
  partners: AffiliatePartner[],
  commissions: AffiliateCommissionLog[],
  rules: AffiliateProgramRules,
}
```

### Program rules fields (UI normalizer supports aliases)

```ts
{
  firstCommissionRate: 20,
  capAmount: 1500000,
  renewalCommissionRate: 10,
  renewalSunsetDays: 180,
  holdDays: 14,
  minPayoutAmount: 500000,
}
```

Alias map: `PROGRAM_RULE_ALIASES` in `constants.ts`.

### Minimal integration diff (when backend is ready)

1. Implement real HTTP calls in `api/service.ts` using `apiGet` / `apiPost` / `apiPut`.
2. Remove `mockStore` and in-memory mutation logic.
3. Delete or isolate `mock-data.ts` from runtime imports.
4. Update `mapAffiliateAdminDashboard()` fallbacks to empty/zero defaults.
5. Optionally split dashboard into separate queries per tab if API is paginated.

### Relationship to frontend affiliate doc

- **Frontend (user):** `hooshran-front/docs/modules/affiliate/affiliate-dashboard-ui_2026-08-17.md`
- **Admin (this doc):** manages payouts, partners, audit log, and rules that feed the user-facing affiliate program.
- Both modules share similar endpoint naming under `/affiliate` (user) vs `/admin/affiliate` (admin) — confirm with backend team.

---

## AI Context Tags

```text
module: affiliate
feature: admin-affiliate-management-ui
app: hooshran-admin
type: new-feature
ui-change: true
ux-change: true
responsive-impact: true
backend-ready: false
mock-data: true
route: /affiliate
framework: react-vite
state: tanstack-query
i18n: true
```
