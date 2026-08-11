import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Ops Upgrade",
  description: "Your central operations hub.",
};

/**
 * Root landing page — public-friendly, auth-aware.
 *
 * Renders the same dashboard grid for both authenticated and unauthenticated
 * visitors.  The welcome header and Personal Tracker tile swap content based
 * on auth state: guests see a locked tile with a login button.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {user
              ? `Welcome back${user.email ? `, ${user.email.split("@")[0]}` : ""}`
              : "Welcome!"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {user
              ? "Here's an overview of your Ops Upgrade modules."
              : "Here's an overview of Ops Upgrade modules."}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {user ? (
            <Link
              href="https://personal.ops-upgrade.net"
              className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-blue-900/60 dark:bg-zinc-900 dark:hover:border-blue-800"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your Personal Tracker
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Track tasks, expenses, media, and more in your personal workspace.
              </p>
              <div className="h-10" />
            </Link>
          ) : (
            <Link
              href="https://personal.ops-upgrade.net/login"
              className="block rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-blue-900/60 dark:bg-zinc-900 dark:hover:border-blue-800"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Log in to view content
              </h3>

              {/* CSS Grid stacking context */}
              <div className="grid mt-1">
                {/* Layer 1: Invisible content to force the exact same height as the authenticated tile */}
                <div className="col-start-1 row-start-1 invisible" aria-hidden="true">
                  <p className="text-sm">
                    Track tasks, expenses, media, and more in your personal workspace.
                  </p>
                  <div className="h-10" />
                </div>

                {/* Layer 2: Flex container pushes the button exactly to the bottom right of the cell */}
                <div className="col-start-1 row-start-1 flex items-end justify-end">
                  <div className="inline-flex items-center justify-center rounded-lg font-medium transition-colors border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 px-4 py-2 text-sm">
                    Login
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
