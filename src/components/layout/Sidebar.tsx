"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Factory,
  Layers,
  Tag,
  Settings2,
  AlignLeft,
  ClipboardList,
  ScrollText,
  ArrowUpFromLine,
  ArrowDownToLine,
  Activity,
  BarChart3,
  UserCheck,
  Shield,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "md:justify-center lg:justify-start",
            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span className="hidden lg:block">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="lg:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

type StaticNavItemProps = {
  label: string;
  icon: LucideIcon;
};

function StaticNavItem({ label, icon: Icon }: StaticNavItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            "text-muted-foreground opacity-50 cursor-default select-none",
            "md:justify-center lg:justify-start",
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span className="hidden lg:block">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="lg:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="hidden md:flex flex-col border-r bg-card md:w-16 lg:w-64 h-screen sticky top-0 shrink-0">
        <div className="flex items-center h-14 border-b px-3 shrink-0 md:justify-center lg:justify-start">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="hidden lg:block text-sm font-bold tracking-tight">
              Textile MS
            </span>
            <span className="lg:hidden text-sm font-bold">T</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
          <NavItem
            href={ROUTES.DASHBOARD}
            label="Dashboard"
            icon={LayoutDashboard}
          />

          <SuperAdminGate>
            <NavItem href={ROUTES.FIRMS.LIST} label="Firms" icon={Building2} />
          </SuperAdminGate>

          <SuperAdminGate>
            <NavItem href={ROUTES.MILLS.LIST} label="Mills" icon={Factory} />
          </SuperAdminGate>

          <PermissionGate module="beam_qualities" action="view">
            <NavItem
              href={ROUTES.BEAM_QUALITIES.LIST}
              label="Beam Qualities"
              icon={Layers}
            />
          </PermissionGate>

          <PermissionGate module="production_qualities" action="view">
            <NavItem
              href={ROUTES.PRODUCTION_QUALITIES.LIST}
              label="Production Qualities"
              icon={Tag}
            />
          </PermissionGate>

          <PermissionGate module="machines" action="view">
            <NavItem
              href={ROUTES.MACHINES.LIST}
              label="Machines"
              icon={Settings2}
            />
          </PermissionGate>

          <PermissionGate module="beams" action="view">
            <NavItem href={ROUTES.BEAMS.LIST} label="Beams" icon={AlignLeft} />
          </PermissionGate>

          <PermissionGate module="production" action="view">
            <NavItem
              href={ROUTES.PRODUCTION.LIST}
              label="Production"
              icon={ClipboardList}
            />
          </PermissionGate>

          <PermissionGate module="takas" action="view">
            <NavItem href={ROUTES.TAKAS.LIST} label="Takas" icon={ScrollText} />
          </PermissionGate>

          <PermissionGate module="mill_outverts" action="view">
            <NavItem
              href={ROUTES.MILL_OUTVERTS.LIST}
              label="Mill Outverts"
              icon={ArrowUpFromLine}
            />
          </PermissionGate>

          <PermissionGate module="mill_inverts" action="view">
            <NavItem
              href={ROUTES.MILL_INVERTS.LIST}
              label="Mill Inverts"
              icon={ArrowDownToLine}
            />
          </PermissionGate>

          <PermissionGate module="machine_info" action="view">
            <NavItem
              href={ROUTES.MACHINE_INFO}
              label="Machine Info"
              icon={Activity}
            />
          </PermissionGate>

          <PermissionGate module="mill_summary" action="view">
            <NavItem
              href={ROUTES.MILL_SUMMARY}
              label="Mill Summary"
              icon={BarChart3}
            />
          </PermissionGate>

          <SuperAdminGate>
            <div className="pt-2">
              <Separator className="mb-2" />
              <p className="hidden lg:block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
              <div className="mt-1 flex flex-col gap-1">
                <NavItem
                  href={ROUTES.ADMIN.PENDING_USERS}
                  label="Pending Users"
                  icon={UserCheck}
                />
                <StaticNavItem label="Permissions" icon={Shield} />
              </div>
            </div>
          </SuperAdminGate>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
