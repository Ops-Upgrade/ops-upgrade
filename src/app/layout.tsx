export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Resolve avatar URL from Supabase Storage (matches personal_tracker logic)
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const userName =
    typeof meta?.full_name === "string" && meta.full_name
      ? (meta.full_name as string)
      : null;
  let userAvatarUrl: string | null = null;
  const avatarTs =
    typeof meta?.avatar_updated_at === "string"
      ? (meta.avatar_updated_at as string)
      : null;
  if (avatarTs && user) {
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(`${user.id}/avatar.jpg`);
    if (data?.publicUrl) {
      userAvatarUrl = `${data.publicUrl}?t=${encodeURIComponent(avatarTs)}`;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider nonce={nonce}>
          <div className="min-h-screen">
            <Navbar
              userEmail={user?.email ?? null}
              userName={userName}
              userAvatarUrl={userAvatarUrl}
            />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
