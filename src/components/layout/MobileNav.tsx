"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  AlignLeft,
  ClipboardList,
  ArrowUpFromLine,
  ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

type TabItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const TABS: TabItem[] = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.BEAMS.LIST, label: "Beams", icon: AlignLeft },
  { href: ROUTES.PRODUCTION.LIST, label: "Production", icon: ClipboardList },
  { href: ROUTES.MILL_OUTVERTS.LIST, label: "Outverts", icon: ArrowUpFromLine },
  { href: ROUTES.MILL_INVERTS.LIST, label: "Inverts", icon: ArrowDownToLine },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex border-t bg-card">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
