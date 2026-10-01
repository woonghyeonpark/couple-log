"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "캘린더", icon: "📅" },
  { href: "/wishes", label: "위시", icon: "⭐" },
  { href: "/vote", label: "투표", icon: "🗳️" },
  { href: "/memories", label: "추억", icon: "📷" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/day") || pathname.startsWith("/plans") : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-[430px] grid-cols-4">
        {TABS.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={isActive(t.href) ? "page" : undefined}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 text-xs",
                isActive(t.href) ? "font-semibold text-foreground" : "text-foreground/50",
              )}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
