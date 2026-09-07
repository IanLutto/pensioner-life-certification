"use client";

// components/shared/ui/BottomNav.tsx
//
// Only wraps the "shell" screens (home, status, help) via the (main)
// route group layout — deliberately NOT present on /self-service or
// /prototypes. The certification flow is a focused, linear task; a tab
// bar inviting a pensioner to jump away mid-session would undercut the
// step-by-step design FlowShell already enforces.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, StatusIcon, HelpIcon } from "./NavIcons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/status", label: "Status", Icon: StatusIcon },
  { href: "/help", label: "Help", Icon: HelpIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-sm">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
