"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  AlignLeft,
  ClipboardList,
  ArrowUpFromLine,
  Menu,
  Building2,
  Factory,
  Layers,
  Tag,
  Settings2,
  ScrollText,
  ArrowDownToLine,
  Activity,
  BarChart3,
  UserCheck,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { useAuthStore } from "@/lib/store/authStore";
import { logoutAction } from "@/lib/actions/auth.actions";

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
];

type MenuLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  onClose: () => void;
};

function MenuLink({ href, label, icon: Icon, onClose }: MenuLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    setOpen(false);
    clear();
    await logoutAction();
  }

  return (
    <>
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

        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
            open
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Menu className="size-5 shrink-0" />
          <span>More</span>
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 flex flex-col p-0">
          <SheetHeader className="h-14 border-b px-4 flex flex-row items-center space-y-0 shrink-0">
            <SheetTitle asChild>
              <Link
                href={ROUTES.HOME}
                onClick={() => setOpen(false)}
                className="text-sm font-bold tracking-tight hover:opacity-80 transition-opacity"
              >
                Textile MS
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
            <MenuLink
              href={ROUTES.DASHBOARD}
              label="Dashboard"
              icon={LayoutDashboard}
              onClose={() => setOpen(false)}
            />

            <SuperAdminGate>
              <MenuLink
                href={ROUTES.FIRMS.LIST}
                label="Firms"
                icon={Building2}
                onClose={() => setOpen(false)}
              />
            </SuperAdminGate>

            <SuperAdminGate>
              <MenuLink
                href={ROUTES.MILLS.LIST}
                label="Mills"
                icon={Factory}
                onClose={() => setOpen(false)}
              />
            </SuperAdminGate>

            <PermissionGate module="beam_qualities" action="view">
              <MenuLink
                href={ROUTES.BEAM_QUALITIES.LIST}
                label="Beam Qualities"
                icon={Layers}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="production_qualities" action="view">
              <MenuLink
                href={ROUTES.PRODUCTION_QUALITIES.LIST}
                label="Production Qualities"
                icon={Tag}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="machines" action="view">
              <MenuLink
                href={ROUTES.MACHINES.LIST}
                label="Machines"
                icon={Settings2}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="beams" action="view">
              <MenuLink
                href={ROUTES.BEAMS.LIST}
                label="Beams"
                icon={AlignLeft}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="production" action="view">
              <MenuLink
                href={ROUTES.PRODUCTION.LIST}
                label="Production"
                icon={ClipboardList}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="takas" action="view">
              <MenuLink
                href={ROUTES.TAKAS.LIST}
                label="Takas"
                icon={ScrollText}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="mill_outverts" action="view">
              <MenuLink
                href={ROUTES.MILL_OUTVERTS.LIST}
                label="Mill Outverts"
                icon={ArrowUpFromLine}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="mill_inverts" action="view">
              <MenuLink
                href={ROUTES.MILL_INVERTS.LIST}
                label="Mill Inverts"
                icon={ArrowDownToLine}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="machine_info" action="view">
              <MenuLink
                href={ROUTES.MACHINE_INFO}
                label="Machine Info"
                icon={Activity}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <PermissionGate module="mill_summary" action="view">
              <MenuLink
                href={ROUTES.MILL_SUMMARY}
                label="Mill Summary"
                icon={BarChart3}
                onClose={() => setOpen(false)}
              />
            </PermissionGate>

            <SuperAdminGate>
              <div className="pt-2">
                <Separator className="mb-2" />
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  <MenuLink
                    href={ROUTES.ADMIN.PENDING_USERS}
                    label="Pending Users"
                    icon={UserCheck}
                    onClose={() => setOpen(false)}
                  />
                  <MenuLink
                    href={ROUTES.ADMIN.USERS}
                    label="Users"
                    icon={Shield}
                    onClose={() => setOpen(false)}
                  />
                </div>
              </div>
            </SuperAdminGate>
          </nav>

          {/* <div className="border-t px-2 py-3 shrink-0">
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-5 shrink-0" />
              <span>Logout</span>
            </button>
          </div> */}
        </SheetContent>
      </Sheet>
    </>
  );
}
