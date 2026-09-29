export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { createServerClient } from "@ops-upgrade/auth-core";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import PublicHeader from "@/components/layout/PublicHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ops Upgrade",
  description: "Track expenses, tasks, and more.",
  icons: {
    icon: "/icons/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Map user metadata to the shared auth-core Navbar shape. user_metadata is
  // user-writable, so coerce types and reject non-https avatars before use.
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  let navbarUser: {
    email: string;
    name: string | null;
    avatarUrl: string | null;
  } | null = null;
  if (user?.email) {
    const rawName = meta?.full_name ?? meta?.name;
    const name = typeof rawName === "string" ? rawName.trim() : null;
    const finalName = name === "" ? null : name;
    let avatarUrl: string | null = null;
    const avatarTs =
      typeof meta?.avatar_updated_at === "string"
        ? meta.avatar_updated_at
        : null;
    if (avatarTs && user) {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${user.id}/avatar.jpg`);
      if (data?.publicUrl?.startsWith("https://")) {
        avatarUrl = `${data.publicUrl}?t=${encodeURIComponent(avatarTs)}`;
      }
    }
    navbarUser = { email: user.email, name: finalName, avatarUrl };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider nonce={nonce}>
          <div className="min-h-screen">
            {navbarUser ? (
              <NavbarWrapper
                user={navbarUser}
                serverDate={new Date().toISOString()}
              />
            ) : (
              <PublicHeader />
            )}
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
