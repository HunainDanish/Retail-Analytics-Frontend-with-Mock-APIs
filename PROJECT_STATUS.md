# Retail Analytics Platform — Project Status

_Last consolidated: 2026-07-25_

---

## Table of Contents

| # | Section |
|---|---|
| 1 | [At a Glance](#1-at-a-glance) |
| 2 | [Implementation Checklist](#2-implementation-checklist) |
| 3 | [Route Map & Access Control](#3-route-map--access-control) |
| 4 | [Runtime Architecture](#4-runtime-architecture) |
| **Part A — Feature Pages** | |
| 5 | [App Shell / Layout](#5-app-shell--layout) |
| 6 | [Theming — Light/Dark Mode](#6-theming--lightdark-mode) |
| 7 | [Overview Dashboard](#7-overview-dashboard) |
| 8 | [Live Cameras](#8-live-cameras) |
| 9 | [Analytics Suite](#9-analytics-suite) |
| 10 | [Store Heatmap](#10-store-heatmap) |
| 11 | [Zone Performance (standalone)](#11-zone-performance-standalone) |
| 12 | [Customer Flow (placeholder)](#12-customer-flow-placeholder) |
| 13 | [Reports](#13-reports) |
| 14 | [Alerts](#14-alerts) |
| 15 | [Login & Session](#15-login--session) |
| 16 | [Admin — Users](#16-admin--users) |
| 17 | [Admin — Zones & Lines](#17-admin--zones--lines) |
| 18 | [Admin — Cameras](#18-admin--cameras) |
| **Part B — Platform Architecture** | |
| 19 | [Cross-Cutting Design System](#19-cross-cutting-design-system) |
| 20 | [Architectural Tradeoffs](#20-architectural-tradeoffs) |
| 21 | [Shared Types — `lib/types.ts`](#21-shared-types--libtypests) |
| 22 | [Shared Color Tokens — `lib/constants.ts`](#22-shared-color-tokens--libconstantsts) |
| **Part C — Integration Milestones** | |
| 23 | [`lib/api/` Mock Layer](#23-libapi-mock-layer) |
| 24 | [Typed API Client Seam](#24-typed-api-client-seam) |
| 25 | [Global Scope Selector Wiring](#25-global-scope-selector-wiring) |
| 26 | [AuthContext](#26-authcontext) |
| 27 | [Route Gating](#27-route-gating) |
| 28 | [Shared Mock User Store](#28-shared-mock-user-store) |
| 29 | [Known Gaps & Deferred Work](#29-known-gaps--deferred-work) |

---

## 1. At a Glance

Retail analytics dashboard suite for store managers and analytics teams — real-time and historical visibility into customer behavior, facility occupancy, and operational health.

**Design philosophy**
- **Reusability** — generic, composable components (`AnalyticsPageLayout` × 5, `KpiCard` × 6, `CameraFrame` for tiles + modal, etc.)
- **Visual consistency** — unified design system (light/dark, oklch blue accent, card layouts, semantic colors)
- **Progressive complexity** — lightweight placeholders (Customer Flow) alongside richer visuals (Heatmap)
- **API-ready mocks** — all UI reads through `lib/api/`; swap `Promise.resolve()` for `fetch()` when a backend lands

**Stack**: Next.js App Router · TypeScript · Tailwind (semantic tokens) · Recharts · SVG · Geist / Geist Mono

**Codebase scale**: 16 routes · 60+ components · 10 `lib/*-data.ts` internal generators · 10 `lib/api/*.ts` modules · shared `lib/types.ts` + `lib/constants.ts`

**Verification**: `npx tsc --noEmit` — **0 TypeScript errors** (last run after typed API seam + scope/auth/gating/user-store work)

**No real backend yet** — in-memory / `localStorage` only; mutations persist for the browser session.

---

## 2. Implementation Checklist

### Features
- [x] App shell: top nav, dropdowns, alert badge, user menu, scope selector, mobile drawer
- [x] Light/dark theme with persisted, hydration-safe toggle
- [x] Overview dashboard: 6 KPI cards + 3 charts, skeleton loading states
- [x] Live Cameras: 10+ tiles, toggleable overlays, status badges, expand-to-modal
- [x] 5 Analytics pages (Traffic, Occupancy, Zones, Dwell Time, Queues) via shared `AnalyticsPageLayout`
- [x] Store Heatmap with per-camera heat blobs, intensity control, embedded zone performance
- [x] Zone Performance standalone page (chart + table, metric toggle)
- [x] Customer Flow MVP placeholder with trajectory viz + informational callout
- [x] Reports: form → simulated generation → styled, print-ready preview
- [x] Alerts: filterable list, severity/status states, Acknowledge/Resolve actions
- [x] Login system with mock users, `localStorage` session, dev user selector
- [x] Admin — Users: CRUD via `lib/api/users.ts` + shared mock store
- [x] Admin — Zones & Lines: canvas polygon/line editor, per-camera shapes, sidebar list
- [x] Admin — Cameras: CRUD table, Add/Edit modal, deterministic 3-state Test modal

### Platform
- [x] Unified design system (color tokens, typography, spacing)
- [x] Shared domain types in `lib/types.ts` (49 consuming files)
- [x] Shared color tokens in `lib/constants.ts` (9 consuming files)
- [x] `lib/api/` mock layer — all UI off direct `lib/*-data.ts` imports (§23)
- [x] `AnalyticsEvent` type; async `AnalyticsPageConfig` (§23)
- [x] Typed API client seam — explicit return types + `MOCK IMPLEMENTATION` headers (§24)
- [x] Global scope selector → re-fetch/re-filter on 10 dashboard pages (§25)
- [x] `AuthContext` — login/logout + `UserMenu` (§26)
- [x] Route gating — auth redirect + admin role check (§27)
- [x] Shared mock user store — auth + admin CRUD unified (§28)
- [x] Verified in-browser: desktop + mobile, both themes, interactive flows

---

## 3. Route Map & Access Control

```
├── /login                              Public — login only
├── /                                   Overview (scope-aware KPIs + charts)
├── /live-cameras                       Live camera grid (scope-filtered)
├── /analytics/traffic                  ┐
├── /analytics/occupancy                │ 5 pages — AnalyticsPageLayout
├── /analytics/zones                    │ + scoped config hooks (§25)
├── /analytics/dwell-time               │
├── /analytics/queues                   ┘
├── /visual-analytics/heatmap           Scope + page camera dropdown
├── /visual-analytics/zone-performance  Scope-aware zone metrics
├── /visual-analytics/customer-flow     Placeholder; scope filters trajectories
├── /reports                            Own store/camera form pickers
├── /alerts                             Own camera/zone filters
├── /admin/cameras                      System Administrator only (§27)
├── /admin/users                        System Administrator only (§27)
└── /admin/zones-lines                  System Administrator only (§27)
```

| Access | Rule |
|---|---|
| Unauthenticated | Redirected to `/login` by `AuthGuard` (§27) — except `/login` itself |
| Authenticated (any role) | All dashboard routes above except `/admin/*` |
| System Administrator | `/admin/cameras`, `/admin/users`, `/admin/zones-lines` |
| Wrong role on `/admin/*` | Access Denied screen (no silent redirect) |

---

## 4. Runtime Architecture

```
app/layout.tsx
└── Providers
    ├── AuthProvider          lib/auth/AuthContext.tsx
    ├── AuthGuard             components/auth/auth-guard.tsx
    └── ScopeProvider         lib/scope/ScopeContext.tsx
        └── {page routes}

DashboardShell (per page)
└── ThemeProvider
    ├── TopNav                alert badge · theme toggle · UserMenu (useAuth)
    ├── ScopeSelector         useScope — Org → Store → Camera → Zone
    └── <main>{children}</main>
```

**Data flow rule**: components/pages → `lib/api/*` → `lib/*-data.ts` generators or in-memory stores (`mock-users.ts`, API CRUD stores). Never import `lib/*-data.ts` from `app/` or `components/`.

**Global React Context** (no Redux/Zustand): `AuthContext` (logged-in user) · `ScopeContext` (org/store/camera/zone) · `ThemeProvider` (light/dark, inside `DashboardShell`)

---

## Part A — Feature Pages

## 5. App Shell / Layout

**Intent**: reusable B2B dashboard chrome every page renders inside.

| File | Purpose | Key decision |
|---|---|---|
| `lib/nav-config.ts` | Nav structure + mock `OPEN_ALERT_COUNT` | Single list drives desktop bar + mobile drawer |
| `lib/scope-data.ts` | Org → Store → Camera → Zone hierarchy tree | Cascading selector derives options from parent |
| `hooks/use-dismiss.ts` | Click-outside + Escape for popovers | Shared by nav, scope, user menu |
| `components/dashboard/alert-badge.tsx` | Notification bell + count pill | Pill only when `count > 0` |
| `components/dashboard/user-menu.tsx` | Avatar + name + role from `useAuth()` | No hardcoded user; logout via context |
| `components/dashboard/nav-dropdown.tsx` | Analytics / Visual Analytics / Admin menus | One generic dropdown component |
| `components/dashboard/scope-selector.tsx` | 4 cascading scope dropdowns | Wired to `ScopeContext` (§25) |
| `components/dashboard/top-nav.tsx` | Sticky nav + utilities + hamburger drawer | `lg` breakpoint for full nav |
| `components/dashboard/dashboard-shell.tsx` | `TopNav` → scope bar → `<main>` | Opt-in wrapper, not `layout.tsx` |
| `app/layout.tsx` | Fonts, SEO, `Providers` wrapper | Geist vars on `<html>` |
| `app/globals.css` | oklch blue `--primary` light/dark | |

---

## 6. Theming — Light/Dark Mode

| File | Purpose | Key decision |
|---|---|---|
| `components/theme-provider.tsx` | Theme state + `localStorage` persistence | `mounted` gate fixes hydration-order bug |
| `components/dashboard/theme-toggle.tsx` | Moon/sun icon in nav | Pure `useTheme()` consumer |
| `dashboard-shell.tsx` | `ThemeProvider` wraps shell only | Same client boundary as `TopNav` |

---

## 7. Overview Dashboard

Six KPI cards + three Recharts charts; scope-aware via `store_id` (§25).

| File | Purpose |
|---|---|
| `lib/overview-data.ts` | KPI object + 3 chart arrays (internal; via `lib/api/analytics.ts`) |
| `components/overview/kpi-card.tsx` | Reusable card + skeleton for all 6 KPIs |
| `visitors-by-hour-chart.tsx` | 24h bar chart — `getVisitorsByHour({ store_id })` |
| `entries-exits-chart.tsx` | Dual-line entries vs exits |
| `occupancy-trend-chart.tsx` | 7-day area chart |
| `app/page.tsx` | KPI grid + chart layout inside `DashboardShell` |

---

## 8. Live Cameras

Responsive grid with toggleable CV overlays, status badges, click-to-expand modal.

| File | Purpose |
|---|---|
| `lib/camera-data.ts` | Mock cameras + percentage-based overlay geometry |
| `components/cameras/*` | `camera-frame`, `camera-tile`, `camera-modal`, `overlay-toggles`, `status-badge` |
| `app/live-cameras/page.tsx` | Grid inside `DashboardShell`; `filterLiveCameras()` by scope (§25) |

`frameUrl: string | null` is the seam for a real video source.

---

## 9. Analytics Suite

Five pages: Traffic · Occupancy · Zones · Dwell Time · Queues.

**`AnalyticsPageLayout`** — driven by `AnalyticsPageConfig`; owns date range, comparison mode, custom dates; render order: controls → stats → chart → comparison toggle → table.

**Shared components**: `DateRangePicker` · `ComparisonToggle` · `AnalyticsChart` · `StatCard` · `DataTable`

**Data**: `lib/analytics-data.ts` via `lib/api/analytics.ts` — per-range generators return `DataRow[]` with `current`/`prior`.

**Scoped hooks** (§25): each page uses `useTrafficAnalyticsConfig()` etc. from `lib/scope/use-scoped-analytics-config.ts`; layout re-fetches on scope change.

**Page files**: ~15 lines each — hook + `<AnalyticsPageLayout config={...} />` inside `DashboardShell`.

---

## 10. Store Heatmap

SVG floor plan + gradient heat blobs; standout demo page.

- **`HeatmapCanvas`** — walls, aisles, zone boundaries, `<ellipse>` blobs, radial gradients, `mix-blend-mode: screen`
- **`lib/heatmap-data.ts`** — per-camera `HeatBlob[]`, `FloorZone`, `ZoneRow`
- **`HeatmapControls`** — camera dropdown, date, time range, opacity
- **`app/visual-analytics/heatmap/page.tsx`** — scope filters camera list; page dropdown narrows within scope via `resolveEffectiveCameraId()` (§25)
- Embedded **`ZonePerformance`** table

---

## 11. Zone Performance (standalone)

- **`ZonePerformance` component** — horizontal bar chart + metric toggle (Visits / Dwell / Occupancy) + sortable table
- **Standalone page** — date range, time pickers, comparison toggle, 4 KPI cards
- **Scope** (§25): `getZonePerformance({ store_id, zone_id })`

---

## 12. Customer Flow (placeholder)

Intentionally minimal — signals "coming soon" without looking unfinished.

- **`CustomerFlowViz`** — 4 hardcoded Bézier trajectory paths over labeled zone rectangles
- **`CustomerFlowControls`** — camera + date pickers
- **`FutureFeatureCallout`** — informational banner (blue, not amber)
- **Scope** (§25): filters camera options + visible trajectories; no API

---

## 13. Reports

Form → 1.5s simulated generation → print-styled preview → export toasts (no real download).

- **`lib/reports-data.ts`** — 5 report types map 1:1 to analytics pages
- **`ReportPreview`** — KPI cards, 2 Recharts, table, `@media print` CSS
- **Not scope-wired** — own store/camera pickers on the form

---

## 14. Alerts

10 mock alerts; filter by severity / status / camera / zone; Acknowledge / Resolve.

- **`lib/alerts-data.ts`** — types, severities, statuses
- **`AlertFilters`** + **`AlertCard`** — optimistic local state Map
- **Not scope-wired** — page-level filter dropdowns only

---

## 15. Login & Session

| Topic | Detail |
|---|---|
| Layout | Centered card at `/login` |
| Password | **Only literal `demo` succeeds** at login — see §28 for why stored passwords are ignored |
| Demo selector | **Demo: Select User** — lists active users as `Name — Role` from `getUsers()` (§28) |
| Validation | Required fields, email format |
| Session | `useAuth().login()` → `lib/api/auth.ts` → `localStorage` |
| Logout | `useAuth().logout()` clears context + `localStorage` → `/login` |
| Protection | `AuthGuard` blocks all routes except `/login` (§27) |
| Seed users | Sarah Chen · Marcus Johnson · Elena Rodriguez · David Kim (+ session-created users) |
| Removed | `mustChangePassword` flow and forced password-change page |

**Auth flow**: `/login` → pick user (optional) → email + `demo` → Overview → `UserMenu` shows logged-in name/role → logout → `/login`.

---

## 16. Admin — Users

CRUD at `/admin/users`; all mutations via **`lib/api/users.ts`** → **`lib/auth/mock-users.ts`** (§28).

| Action | API | Notes |
|---|---|---|
| List | `getUsers()` | 4 seed users + any created in-session |
| Add | `createUser()` | Password stored on record; appears in login dropdown |
| Edit | `updateUser()` | No password field — use Reset Password |
| Reset password | `resetPassword()` | Updates stored `password` field |
| Delete | `deleteUser()` | Self-delete → `useAuth().logout()` |

**Components**: `user-table.tsx` · `user-modal.tsx` · `reset-password-modal.tsx` · summary cards (Total / Active / Disabled)

**Access**: System Administrator only (§27)

---

## 17. Admin — Zones & Lines

Canvas polygon/line editor at `/admin/zones-lines`.

**Modes**: Select · Draw Zone (polygon + name/type) · Draw Line (two-point counting line + inside side)

**Features**: per-camera shapes (CAM-001/002/003), sidebar list, delete per row, Save logs to console (mock).

**Components**: `zones-lines-canvas.tsx` · `editor-toolbar.tsx` · `shapes-sidebar.tsx` · `zone-name-form.tsx` · `line-side-form.tsx`

**Access**: System Administrator only (§27). Shape CRUD API exists but canvas uses local state — see §29.

---

## 18. Admin — Cameras

Infrastructure CRUD at `/admin/cameras`.

- **`lib/admin-cameras-data.ts`** — 5 seed cameras, 2 stores, module assignments
- **`CameraTable`** — status badges, module pills, Test / Enable-Disable / Edit / Delete
- **`CameraModal`** — add/edit with module checkboxes
- **`TestCameraModal`** — deterministic Loading → Success/Error (not yet calling `testCamera()` API — §29)
- **State**: in-memory via `lib/api/cameras.ts`

**Access**: System Administrator only (§27)

---

## Part B — Platform Architecture

## 19. Cross-Cutting Design System

**Tokens**: oklch blue primary · severity/status/occupancy in `lib/constants.ts` · Geist + Geist Mono · Tailwind spacing scale · full light/dark

**State**
- Page-local state stays local
- Global: `AuthContext` · `ScopeContext` · `ThemeProvider` (dashboard only)
- Optimistic UI where applicable
- Deterministic mocks (no random data except intentional demo delays)

**Reusability**: `AnalyticsPageLayout` × 5 · `ZonePerformance` in heatmap + standalone · modal/table patterns shared across admin and analytics

**Component hierarchy**
```
DashboardShell → TopNav + Scope bar + Page Content (controls → KPIs → viz → table)
Modals float above: camera/user/report dialogs
```

---

## 20. Architectural Tradeoffs

| Decision | Chosen | Alternative | Rationale |
|---|---|---|---|
| State management | React Context + local state | Zustand/Redux | MVP scope; auth + scope are only global concerns |
| Route protection | Client `AuthGuard` wrapper | Next.js middleware | Session in `localStorage`; avoid flash via loading gate |
| Mock data | Deterministic generators + in-memory stores | Pre-computed arrays | Flexible; CRUD persists per session |
| API surface | `lib/api/` Promise wrappers | Direct data imports | Single swap point for real `fetch()` |
| Charts | Recharts | D3 / Three.js | Speed vs flexibility |
| Heatmap | SVG + gradients | Canvas/WebGL | Accessibility; fine at demo scale |
| Login password | Hardcoded `demo` check | Per-user stored password | Preserves demo UX until real auth |
| Export | Toast only | Real downloads | MVP scope |

---

## 21. Shared Types — `lib/types.ts`

**Intent**: one canonical export for ~45 domain types (consolidation, not redesign). **49 files** updated to import from here.

**Domains**: Analytics (+ `AnalyticsEvent`) · Live cameras · Heatmap · Alerts · Admin cameras · Reports · Scope selector · Zones/lines editor · Users & auth

**Disambiguated names**: `AdminCamera` · `HeatmapCamera` · `ScopeCamera`/`ScopeZone` · `LiveCameraStatus` vs `CameraStatus`

**Left out**: component prop interfaces · file-local UI unions · canvas ephemeral state · nav/theme types

**Follow-up fixes**: Recharts tooltip typing · `reports-data.ts` key typo · `ReportData.chartData` relaxed typing

---

## 22. Shared Color Tokens — `lib/constants.ts`

**Intent**: canonical severity, status, occupancy colors — **9 files** refactored.

**Groups**: `SEVERITY_COLORS` · `STATUS_COLORS` (alert/camera/live-camera/user) · `ACTION_STATUS_COLORS` · `OCCUPANCY_THRESHOLD_COLORS` + helpers

**Left out**: `ROLE_COLORS` · form validation reds · report chart palette · customer-flow blues · per-zone identity colors

---

## Part C — Integration Milestones

## 23. `lib/api/` Mock Layer (2026-07-25)

**Intent**: Promise-based API between UI and mocks; `lib/*-data.ts` is internal only.

| Module | Key exports | Backing |
|---|---|---|
| `stores.ts` | `getStores`, `getOrganizations` | `scope-data.ts` |
| `analytics.ts` | traffic/occupancy/zones/dwell/heatmap/queues + overview helpers | `analytics-data`, `overview-data`, `heatmap-data` |
| `events.ts` | `getEvents()` | deterministic event stream — **no UI consumer yet** |
| `alerts.ts` | `getAlerts`, `updateAlert` | `alerts-data.ts` |
| `reports.ts` | `getReport` + form constants | `reports-data.ts` |
| `cameras.ts` | CRUD + `getLiveCameras`, `testCamera` | `admin-cameras-data`, `camera-data` |
| `zones.ts` | zone CRUD + `getAllShapes` | `zones-lines-data.ts` |
| `lines.ts` | line CRUD | shared store in `zones.ts` |
| `users.ts` | user CRUD + constants | **`mock-users.ts` (§28)** |
| `auth.ts` | `login`, `loginByRole`, `logout`, `getCurrentUser` | `users.ts` + `localStorage` |

**Type changes**: `AnalyticsEvent` added · `AnalyticsPageConfig.getData/getStats` → `Promise<>`

**Rewired components** (import `lib/api/` not `lib/*-data.ts`):

| Component | API module(s) |
|---|---|
| `analytics-page-layout.tsx` | async `config.getData` / `getStats` |
| `visitors-by-hour-chart.tsx` | `analytics` |
| `entries-exits-chart.tsx` | `analytics` |
| `occupancy-trend-chart.tsx` | `analytics` |
| `scope-selector.tsx` | `stores` |
| `user-menu.tsx` | `auth` via `useAuth()` |
| `report-form.tsx` | `reports` |
| `alert-card.tsx` | `alerts` |
| `camera-modal.tsx` · `camera-table.tsx` | `cameras` |
| `user-modal.tsx` · `user-table.tsx` | `users` |
| `zones-lines-canvas.tsx` · `shapes-sidebar.tsx` · `zone-name-form.tsx` | `zones` |

**Rewired app pages** (15): `app/page.tsx` · `app/login/page.tsx` · `app/live-cameras/page.tsx` · all 5 `app/analytics/*/page.tsx` · `app/visual-analytics/heatmap/page.tsx` · `app/visual-analytics/zone-performance/page.tsx` · `app/reports/page.tsx` · `app/alerts/page.tsx` · `app/admin/cameras/page.tsx` · `app/admin/users/page.tsx` · `app/admin/zones-lines/page.tsx` (`customer-flow` had no direct data imports).

**Loading pattern**: `useEffect` + async/await; skeletons/spinners on first load and on range/scope change

---

## 24. Typed API Client Seam (2026-07-25)

- `MOCK IMPLEMENTATION` header on all 10 `lib/api/*.ts` files
- Explicit return types on **47** exported functions
- Type tightenings: `FloorZone[]`, `Resolution`, `ZonesLinesCameraOption[]`, `Omit<>` CRUD types, report option aliases
- **`npx tsc --noEmit` → 0 errors**

---

## 25. Global Scope Selector Wiring (2026-07-25)

**Intent**: scope bar drives re-fetch/re-filter. Global scope = outer filter; page controls (heatmap camera, customer-flow camera) narrow within it.

| File | Role |
|---|---|
| `lib/scope/ScopeContext.tsx` | `useScope()` — org/store/camera/zone + cascade resets |
| `lib/scope/date-range.ts` | `DateRangeKey` → `{ from, to }` |
| `lib/scope/scope-filters.ts` | scaling, camera filtering, `resolveEffectiveCameraId()` |
| `lib/scope/use-scoped-analytics-config.ts` | scoped analytics config hooks |
| `components/providers.tsx` | `ScopeProvider` inside `AuthGuard` |
| `scope-selector.tsx` | reads/writes context |
| `analytics-page-layout.tsx` | re-fetches on scope change |

**Wired pages (10)**: Overview · 5 analytics · Live Cameras · Heatmap · Zone Performance · Customer Flow

**Not wired**: Login · Reports · Alerts · Admin pages (own pickers or role-gated)

**Mock limitation**: APIs accept scope params but base series unchanged — deterministic scaling/filtering until real backend

---

## 26. AuthContext (2026-07-25)

| File | Role |
|---|---|
| `lib/auth/AuthContext.tsx` | `useAuth()` — `{ id, name, email, role, mustChangePassword }` |
| `components/providers.tsx` | `AuthProvider` → `AuthGuard` → `ScopeProvider` |
| `app/login/page.tsx` | `useAuth().login()` |
| `user-menu.tsx` | reads `user` from context; no hardcoded fallback |

**Persistence**: API writes `localStorage`; provider hydrates on mount; `logout()` clears both context and storage.

**`mustChangePassword`**: always `false` today (flow removed).

---

## 27. Route Gating (2026-07-25)

**Approach**: client-side **`AuthGuard` wrapper** in `Providers` — **not** Next.js middleware.

| Layer | Behaviour |
|---|---|
| Unauthenticated | `router.replace('/login')`; `AuthLoading` blocks children — **no flash of protected content** |
| `/login` | Public |
| `/admin/*` | `app/admin/layout.tsx` requires `role === "System Administrator"`; else **Access Denied** + Back to Overview |

**Files**: `auth-guard.tsx` · `auth-loading.tsx` · `access-denied.tsx` · `app/admin/layout.tsx`

**Test matrix**: non-admin → `/admin/users` → Access Denied · no session → `/login` · System Administrator → admin loads · no flash before auth redirect

---

## 28. Shared Mock User Store (2026-07-25)

**Intent**: one in-memory store for auth + admin CRUD. Replaced disconnected copies in `auth-data.ts`, `admin-users-data.ts`, and `api/users.ts`.

| File | Role |
|---|---|
| `lib/auth/mock-users.ts` | **Single store** — seed 4 users + `password` field + CRUD |
| `lib/api/users.ts` | thin wrapper |
| `lib/api/auth.ts` | `getUsers()` for login lookup |
| `admin/users/page.tsx` | all mutations via API; self-delete → logout |
| `user-modal.tsx` | passes `password` on create |
| `login/page.tsx` | demo dropdown from `getUsers()` |

**Why only `demo` works at login**: `login()` checks `password === DEFAULT_MOCK_PASSWORD` (`"demo"`) deliberately — not the per-user stored password. Stored password **is** updated by Add User / Reset Password for a future real auth swap.

**Edge cases**

| Scenario | Behaviour |
|---|---|
| Create user | Appears in admin table + login dropdown immediately |
| Delete user | Removed from dropdown |
| Delete self | Logged out via `AuthContext` |
| Reset password | Store updated; login still needs `demo` |
| Full page refresh | Store resets to 4 seed users |

---

## 29. Known Gaps & Deferred Work

| Area | Status |
|---|---|
| **`getEvents()`** | Implemented; no UI consumer |
| **`testCamera()` API** | `TestCameraModal` uses inline logic, not API |
| **Zones/lines CRUD** | API exists; canvas uses local state; Save logs to console |
| **Dual camera models** | `getLiveCameras()` vs admin `getCameras()` — not unified |
| **Analytics `from`/`to`** | API accepts params; UI still uses `DateRangeKey` pills |
| **Reports / Alerts scope** | Not tied to global scope selector |
| **Scope mock payloads** | Scaling/filtering only; same base data underneath |
| **Per-user password login** | Deferred until real backend |
| **`loginByRole()`** | Exported; login page uses `login(email, password)` with pre-filled email |
| **`auth-data.ts`** | Deprecated shim — use `mock-users.ts` |

**When backend lands (Module 12)**: replace function bodies inside `lib/api/*.ts` only — signatures and `lib/types.ts` contracts must not change.

---
