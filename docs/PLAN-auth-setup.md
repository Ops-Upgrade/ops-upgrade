# Authentication Architecture & Implementation Plan

## 1. Objective
Enable seamless, cross-subdomain authentication between `personal.ops-upgrade.net` (the existing personal tracker app) and `ops-upgrade.net` (the new root domain app). 

**The constraints are:**
- `ops-upgrade.net` is a fully public-facing landing page.
- It will **not** have its own login or signup flow.
- If a user visits `ops-upgrade.net` and is currently logged into `personal.ops-upgrade.net`, the UI must recognize this state and display personalized elements (Settings, Sign Out, and a redirect tile).
- Unauthenticated users must be able to browse the site normally without being forcefully redirected to a login page.

---

## 2. Findings from `personal-tracker`
A thorough review of the `personal_tracker` repository revealed how the shared authentication is currently structured:

1. **Cookie-Based Session Storage**:
   The application relies entirely on `@supabase/ssr` to store Supabase session tokens in browser cookies instead of local storage. This is the foundational requirement for cross-subdomain auth.

2. **Domain Scoping (`NEXT_PUBLIC_COOKIE_DOMAIN`)**:
   In `src/lib/constants.ts`, the `COOKIE_OPTIONS` object explicitly sets the cookie `domain` based on the environment variable `NEXT_PUBLIC_COOKIE_DOMAIN`. In production, this is set to `.ops-upgrade.net`, which tells the browser to send the auth cookies to `personal.ops-upgrade.net`, `www.ops-upgrade.net`, and `ops-upgrade.net`.

3. **Supabase Client Factories**:
   The `src/lib/supabase/` directory contains three distinct client factories:
   - `client.ts`: Used in browser components.
   - `server.ts`: Used in Server Components, wrapping `cookies().getAll()` to read the session server-side.
   - `proxy.ts`: Used in Next.js middleware. It handles reading the request cookies and writing updated session cookies to the `NextResponse`.

4. **The Proxy (Session Refresh and Guards)**:
   The `src/proxy.ts` middleware acts as the gatekeeper. It intercepts all requests, initializes the proxy client, and calls `supabase.auth.getClaims()`. This step is crucial because it validates the JWT against the server and automatically refreshes stale access tokens, writing the new tokens back to the cookie. 
   - *Current Behavior in personal-tracker*: After refreshing the session, it explicitly blocks unauthenticated users by redirecting them to `/login`.

---

## 3. Detailed Implementation Plan for `ops-upgrade.net`

To achieve the objective, we must replicate the infrastructure but carefully remove the restrictive routing guards.

### Step 3.1: Foundation & Dependencies
- Initialize the Next.js 16 App Router in the `ops-upgrade` repository.
- Install `@supabase/ssr` and `@supabase/supabase-js`.
- Ensure no `brace-expansion` override (or similar minimatch-breaking resolution) is added to `package.json` to avoid breaking the deployment linter.
- Define `.env.local` to mirror the target environment:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
  NEXT_PUBLIC_COOKIE_DOMAIN=localhost # (.ops-upgrade.net in production)
  ```

### Step 3.2: Porting the Crypto/Auth Clients
- Copy `src/lib/constants.ts` verbatim from `personal-tracker` to retain `COOKIE_OPTIONS`.
- Copy `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/proxy.ts` verbatim. This ensures cookie reads/writes are identical across both codebases.

### Step 3.3: The "Relaxed" Proxy
- Create `src/proxy.ts` in `ops-upgrade`.
- It will initialize the client and call `await supabase.auth.getClaims()`.
- **The Twist**: We will completely remove the redirection logic (`if (!user) redirect('/login')`). 
- The proxy will simply return the `response` object. This ensures the auth cookies are kept alive and refreshed if they exist, but public traffic flows through unimpeded if they do not.
- The proxy must include the CSP relaxation logic using `VERCEL_ENV` to allow Vercel Live (`https://vercel.live`) and Pusher (`wss://ws-us3.pusher.com`) strictly in preview environments without weakening production security.

### Step 3.4: Server-Side State Consumption
- In `src/app/layout.tsx` and `src/app/page.tsx`, we will invoke the server client to determine the user's state:
  ```typescript
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  ```
- The `user` object will be passed down to the layout (for the Navbar) and the page (for the redirect tile). If `user` is null, the site simply renders its default public view.
