# Master Implementation Plan for ops-upgrade.net

This document outlines the strict chronological order for implementing `ops-upgrade.net`. The dev agent must follow these phases sequentially to avoid dependency issues or missing references.

## References
- `docs/PLAN-auth-setup.md`
- `docs/PLAN-dashboard-with-same-css.md`

---

## Phase 1: Foundation (Scaffolding & Config) - [DONE]
*Goal: Build the project skeleton and install dependencies.*

1. **Initialize Next.js**: 
   - Run the Next.js 16 App Router scaffolding (non-interactive) in the current directory (`ops-upgrade`).
   - *Sanity check note*: The reference project (`personal_tracker`) currently uses Next.js `16.3.0`.
2. **Install Dependencies**: 
   - Install `@supabase/ssr`, `@supabase/supabase-js`, Tailwind v4 dependencies (`tailwindcss`, `@tailwindcss/postcss`), `@wrksz/themes`, and `lucide-react`.
   - Ensure `package.json` is clean and does **not** include any `brace-expansion` overrides (as per the recent linter fix).
3. **Environment Setup**: 
   - Create `.env.local` to define the local Supabase keys and cookie domains (see `PLAN-auth-setup.md`).
4. **CSS Architecture**: 
   - Copy `src/app/globals.css` from `personal_tracker` to import the global overrides and utility classes (`.gem-tile`, etc.).

---

## Phase 2: Authentication Core - [DONE]
*Goal: Wire up cross-subdomain authentication before the UI tries to consume user state.*

1. **Constants**: 
   - Copy `src/lib/constants.ts` (for `COOKIE_OPTIONS`).
2. **Supabase Clients**: 
   - Copy `client.ts`, `server.ts`, and `proxy.ts` into `src/lib/supabase/`.
3. **The Middleware**: 
   - Create the root `src/proxy.ts` as the middleware (or adapt to `middleware.ts` if required by Next.js conventions).
   - Implement the "Relaxed" proxy by removing the `/login` redirect logic.
   - Include the Vercel CSP preview logic using `VERCEL_ENV` to safely allow Vercel Live (`https://vercel.live`) and Pusher (`wss://ws-us3.pusher.com`) strictly in preview environments.

---

## Phase 3: Theming & Global Layout - [DONE]
*Goal: Build the shell of the application.*

1. **Components**: 
   - Port `src/components/common/ThemeSwitcher.tsx` (ensure it includes the latest mount state fix).
   - Port the `useScrollDirection` hook.
2. **Navbar**: 
   - Port `src/components/layout/Navbar.tsx` and modify it for public access. 
   - Conditionally render user state (Avatar, Settings, Sign Out) only if `user` is provided. If `null`, only show the ThemeSwitcher.
   - Update the "Sign Out" logic to clear shared cookies and refresh.
3. **Layout**: 
   - Update `src/app/layout.tsx`.
   - Wrap the application in `ThemeProvider` from `@wrksz/themes`.
   - Plumb the `x-nonce` from Next.js headers down to the `ThemeProvider` to prevent inline scripts from violating strict CSP.
   - Include the `Navbar` component.

---

## Phase 4: The Landing Page (Routing & UI)
*Goal: Tie it all together on the main route.*

1. **Page Logic**: 
   - Update `src/app/page.tsx` as a Server Component.
   - Run the server-side `supabase.auth.getUser()` check.
2. **Conditional UI**: 
   - **If authenticated**: Render the Welcome Header and the CSS Grid with the single "Your Personal Tracker" tile, styled exactly like the reference cards. The tile should link externally to `https://personal.ops-upgrade.net/dashboard`.
   - **If unauthenticated**: Render placeholder marketing copy for Ops Upgrade.

---

## Phase 5: Correction (1:1 UI Fidelity)
*Goal: Fix the bootleg UI by porting the exact layout, greeting, components, and logo styling from personal_tracker without improvising.*

1. **Exact Navbar Porting**: 
   - Port `@/api/serverDate` logic so the IST date and day display perfectly.
   - Use the exact logo image elements (`logo-with-name.png` and `logo-with-name-light.png` only, plus `favicon.svg` for the site icon) instead of fallback text.
   - Ensure the right-side layout spacing and avatar match 1:1.
2. **Exact Dashboard Layout**: 
   - Replicate the space-y-8 layout container, the exact greeting parsing (user.email.split('@')[0]), and the subtitle ('Here''s an overview of your personal tracker.').
3. **1:1 Card Components**: 
   - Instead of a generic .gem-tile, use one of the exact SVGs, border colors, and hover effects from personal_tracker (e.g., the Blue Task Manager styling) for the 'Your Personal Tracker' link.
