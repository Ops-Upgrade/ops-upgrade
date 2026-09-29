"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@wrksz/themes/client";
import { ThemeSwitcher } from "@ops-upgrade/auth-core/ui";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Menu, X } from "lucide-react";

/**
 * Public-facing top navigation bar — the logged-out fork of the shared
 * auth-core Navbar (which strictly requires a user with an email).
 *
 * 1:1 port of the logged-out branch of the former local Navbar: logo,
 * hamburger toggle, and a dropdown containing only the theme row.
 */
export default function PublicHeader() {
  const { resolvedTheme } = useTheme();
  const scrollDirection = useScrollDirection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/logo-with-name.png"
      : "/images/logo-with-name-light.png";

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-zinc-200 bg-white transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: App Logo */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={logoSrc}
              alt="Ops Upgrade"
              width={160}
              height={40}
              priority
              className="h-8 w-auto rounded sm:h-9"
            />
          </Link>
        </div>

        {/* Right: Hamburger Toggle (All Screens) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          <div className="flex shrink-0 items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="cursor-pointer p-2 text-zinc-500 hover:text-zinc-900 focus:outline-none dark:text-zinc-400 dark:hover:text-zinc-100"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu (All Screens) */}
      {isMobileMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-16 flex w-56 flex-col gap-1 rounded-bl-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Theme
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
