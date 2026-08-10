# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role: Dev Agent

You are the **dev agent** — you implement, not architect. The human will copy-paste instructions from Gemini (the planner) into chat. Follow those instructions exactly. Plans live in `docs/` as `PLAN-<topic>.md`; the master execution order is `docs/plan-master-implementation.md`.

If you hit a missing architectural decision, flag it — don't decide it yourself.

## Current State

This repo is **pre-implementation** — the scaffolding has not been built yet. Only plans exist. All implementation must follow the phased sequence in `docs/plan-master-implementation.md`.

## Tech Stack (Planned)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Matches `personal_tracker` at v16.3.0 |
| Auth | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) | Cross-subdomain cookies via `.ops-upgrade.net` |
| Styling | Tailwind CSS v4 + `@tailwindcss/postcss` | Shared `globals.css` from `personal_tracker` |
| Theming | `@wrksz/themes` | `ThemeProvider`, `ThemeSwitcher` (Light/Dark/System) |
| Icons | `lucide-react` | |
| Hosting | Vercel | `VERCEL_ENV` used to vary CSP by environment |

## Architecture

### Cross-Subdomain Auth Model

The root domain (`ops-upgrade.net`) shares auth state with `personal.ops-upgrade.net` via Supabase session cookies scoped to `.ops-upgrade.net`. Three client factories — all ported verbatim from `personal_tracker` — handle different contexts:

- `src/lib/supabase/client.ts` — browser-side Supabase client
- `src/lib/supabase/server.ts` — server-component client (reads cookies via `cookies().getAll()`)
- `src/lib/supabase/proxy.ts` — middleware client (reads/writes cookies on `NextResponse`)

`src/lib/constants.ts` holds `COOKIE_OPTIONS` with the domain scoping via `NEXT_PUBLIC_COOKIE_DOMAIN` (`.ops-upgrade.net` in production, `localhost` in dev).

### The "Relaxed" Middleware (Key Difference)

Unlike `personal_tracker` (which redirects unauthenticated users to `/login`), the middleware here (`src/proxy.ts`) **only refreshes auth cookies** — it never blocks or redirects. This keeps the session alive for authenticated users while letting public traffic through unimpeded.

### CSP Strategy

Content Security Policy varies by environment:
- **Preview** (`VERCEL_ENV=preview`): allows `https://vercel.live` and `wss://ws-us3.pusher.com`
- **Production**: strict CSP, no preview exceptions

### Page Structure

`src/app/page.tsx` is a server component that calls `supabase.auth.getUser()` and renders two distinct states:
- **Authenticated**: welcome header + grid with a single "Your Personal Tracker" tile linking externally to `https://personal.ops-upgrade.net/dashboard`
- **Unauthenticated**: public-facing marketing content (placeholder for now)

The Navbar (`src/components/layout/Navbar.tsx`) also bifurcates on auth state — showing avatar/settings/sign-out when authenticated, or just the ThemeSwitcher (and optionally a sign-in link) when not.

### Theme System

`@wrksz/themes` provides `ThemeProvider` (wrapping the root layout) and `ThemeSwitcher`. The `x-nonce` header from Next.js must be plumbed to `ThemeProvider` to keep inline scripts CSP-compliant. The design uses two backgrounds: Light `#fafafa`, Dark `#09090b`.

## Implementation Phases (from `docs/plan-master-implementation.md`)

1. **Phase 1 — Foundation**: scaffold Next.js 16, install deps, `.env.local`, copy `globals.css`
2. **Phase 2 — Authentication Core**: port constants, Supabase clients, and the relaxed middleware
3. **Phase 3 — Theming & Global Layout**: port ThemeSwitcher, Navbar, `useScrollDirection` hook; wrap in `ThemeProvider`
4. **Phase 4 — Landing Page**: server-side auth check, conditional UI

**Never skip a phase or implement out of order.** Each phase builds on the previous one.

## Reference Repositories

- `personal_tracker` — the sibling app at `personal.ops-upgrade.net` from which auth clients, CSS, and components are ported. Its middleware redirects unauthenticated users; ours must not.

## Important Constraints

- The `brace-expansion` package must NOT have an override in `package.json` (it breaks the Vercel deployment linter).
- Auth cookies are set with `SameSite=Lax` — sufficient for same-subdomain navigation, no `SameSite=None` needed.
- "Sign Out" clears shared Supabase cookies and refreshes the page; it does NOT clear `personal-tracker`-specific caches.
