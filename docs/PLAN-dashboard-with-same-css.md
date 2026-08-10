# Dashboard & CSS Implementation Plan

## 1. Objective
The `ops-upgrade.net` repository needs to mirror the exact aesthetic, CSS architecture, and dashboard layout of `personal.ops-upgrade.net`. However, because this is a public-facing domain, the dashboard layout will be adapted to serve as a landing page. It will conditionally display a single "Go to Personal Tracker" tile and personalized top bar options only if the user is authenticated.

---

## 2. Findings from `personal-tracker`
Reviewing the `personal_tracker` repository revealed exactly how the UI is constructed and themed:

1. **Global CSS and Tailwind Architecture**:
   - The app uses Tailwind CSS v4 alongside `@tailwindcss/postcss`.
   - `src/app/globals.css` contains highly specific global overrides, including:
     - Root CSS variables for Light (`--background: #fafafa`) and Dark (`--background: #09090b`) modes.
     - A custom `@custom-variant dark` directive.
     - Global cursor overrides ensuring all `button` and input elements display the pointer cursor properly.
     - Custom pseudo-element styling (`.gem-tile` for diagonal glints/reflections) and keyframe animations (`matrix-rain`).

2. **Theme Management**:
   - The app uses `@wrksz/themes` (`ThemeProvider`, `ThemeSwitcher`) to toggle between Light, Dark, and System modes seamlessly without React hydration mismatches.

3. **Navbar Component (`src/components/layout/Navbar.tsx`)**:
   - A sticky top bar that hides on scroll-down and reappears on scroll-up using a custom `useScrollDirection` hook.
   - Contains a left-aligned logo (which swaps based on the active theme).
   - Contains right-aligned user information (Avatar/Initials, Name, current IST date) and a hamburger menu containing the Theme Switcher, Settings link, and Sign Out button.

4. **Dashboard Page (`src/app/(protected)/dashboard/page.tsx`)**:
   - Layout consists of a header ("Welcome back, {Name}") and a CSS Grid (`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`).
   - Cards are built using Next.js `<Link>` components, styled with dynamic borders, hover shadows, and SVG icons encased in rounded background squares.

---

## 3. Detailed Implementation Plan for `ops-upgrade.net`

### Step 3.1: CSS & Theme Replication
- Install Tailwind v4, `@tailwindcss/postcss`, `lucide-react`, and `@wrksz/themes`.
- Copy `src/app/globals.css` completely to ensure the exact same base styles, typography, and utility classes (`.gem-tile`) are available.
- Wrap the root `layout.tsx` in the `ThemeProvider` from `@wrksz/themes`.
- In `layout.tsx`, plumb the `x-nonce` from Next.js headers down to the `ThemeProvider` to prevent inline scripts from violating strict CSP.

### Step 3.2: Adapting the Navbar
- Port `src/components/layout/Navbar.tsx` and the `useScrollDirection` hook.
- Ensure the ported `ThemeSwitcher` component includes the recent fix for correctly detecting and switching themes on mount.
- **Modifications for Public Access**:
  - The component will accept an optional `user` prop.
  - If `user` is `null`, the right side of the Navbar will *only* display the `ThemeSwitcher` (and perhaps a "Sign In" link pointing to `https://personal.ops-upgrade.net/login`).
  - If `user` is provided, the Navbar will render the Avatar, Name, and the hamburger menu containing "Settings" and "Sign Out".
  - The "Sign Out" logic will be modified to clear the shared Supabase auth cookies and refresh the current page, rather than clearing `personal-tracker` specific caches.

### Step 3.3: Adapting the Dashboard (Landing Page)
- We will construct `src/app/page.tsx` using the exact layout structure of the protected dashboard from `personal-tracker`.
- **The Authenticated State**:
  - We will query `supabase.auth.getUser()` server-side.
  - If a user exists, we will render the Welcome Header ("Welcome back, {Name}").
  - We will render the exact Tailwind Grid `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`.
  - Inside the grid, we will render exactly **one tile**: "Your Personal Tracker".
  - We will reuse the styling from one of the existing cards (e.g., the Violet or Emerald styling), complete with the hover effects.
  - The `<Link>` will point externally to `https://personal.ops-upgrade.net/dashboard`.
- **The Unauthenticated State**:
  - If the user is not logged in, the grid and welcome header will not be rendered.
  - Instead, the page will display the standard public-facing marketing copy for Ops Upgrade (to be designed later).
