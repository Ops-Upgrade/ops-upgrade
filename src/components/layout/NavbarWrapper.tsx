"use client";

import { Navbar } from "@ops-upgrade/auth-core/ui";
import { useRouter } from "next/navigation";

const PERSONAL_URL =
  process.env.NEXT_PUBLIC_PERSONAL_URL || "https://personal.ops-upgrade.net";

interface NavbarWrapperProps {
  /** Guaranteed non-null by the caller (layout only renders this when user.email exists). */
  user: {
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
  serverDate: string;
}

/**
 * Client wrapper around the shared auth-core Navbar.
 *
 * Supplies the app-specific values the core component can't know: route
 * targets on the central auth domain, the theme-aware logo pair, and the
 * logout redirect. The logout URL passes the full encoded origin so the
 * auth domain's allowlist validation succeeds for the production origin.
 */
export default function NavbarWrapper({ user, serverDate }: NavbarWrapperProps) {
  const router = useRouter();

  function handleLogout() {
    router.push(`${PERSONAL_URL}/logout?redirect=${encodeURIComponent(
      window.location.origin
    )}`);
  }

  // Defensive re-check: never hand the core Navbar a non-https avatar.
  const safeUser = {
    ...user,
    avatarUrl:
      user.avatarUrl && user.avatarUrl.startsWith("https://")
        ? user.avatarUrl
        : null,
  };

  return (
    <Navbar
      user={safeUser}
      serverDate={serverDate}
      routes={{
        dashboard: `${PERSONAL_URL}/dashboard`,
        profile: `${PERSONAL_URL}/settings/profile`,
      }}
      onLogout={handleLogout}
      logoSrcLight="/images/logo-with-name-light.png"
      logoSrcDark="/images/logo-with-name.png"
    />
  );
}
