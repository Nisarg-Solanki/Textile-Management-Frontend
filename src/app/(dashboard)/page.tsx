"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlignLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  ClipboardList,
  Factory,
  Layers,
  ListChecks,
  ScrollText,
  Settings2,
  Tag,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { getPendingUsers } from "@/lib/api/auth";
import { ROUTES } from "@/lib/routes";

const SETUP_STEPS = [
  {
    step: 1,
    name: "Add Firms",
    description: "Register textile firms in the system.",
    href: ROUTES.FIRMS.LIST,
  },
  {
    step: 2,
    name: "Add Mills",
    description: "Add processing mills linked to firms.",
    href: ROUTES.MILLS.LIST,
  },
  {
    step: 3,
    name: "Add Beam Qualities",
    description: "Define beam quality standards.",
    href: ROUTES.BEAM_QUALITIES.LIST,
  },
  {
    step: 4,
    name: "Add Production Qualities",
    description: "Define production quality grades.",
    href: ROUTES.PRODUCTION_QUALITIES.LIST,
  },
  {
    step: 5,
    name: "Add Machines",
    description: "Register weaving machines per firm.",
    href: ROUTES.MACHINES.LIST,
  },
  {
    step: 6,
    name: "Add Beams",
    description: "Create beams referencing beam quality.",
    href: ROUTES.BEAMS.LIST,
  },
  {
    step: 7,
    name: "Add Production Info",
    description: "Log production referencing quality, machine, and beam.",
    href: ROUTES.PRODUCTION.LIST,
  },
  {
    step: 8,
    name: "Mill Outvert → Mill Invert",
    description: "Record mill outvert and invert flows.",
    href: ROUTES.MILL_OUTVERTS.LIST,
  },
] satisfies { step: number; name: string; description: string; href: string }[];

export default function DashboardPage() {
  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ["pending-users"],
    queryFn: () => getPendingUsers(),
  });

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <SuperAdminGate>
          <ModuleCard
            icon={<Building2 className="size-6 text-primary" />}
            title="Firms"
            description="Manage textile firms"
            href={ROUTES.FIRMS.LIST}
          />
          <ModuleCard
            icon={<Factory className="size-6 text-primary" />}
            title="Mills"
            description="Manage processing mills"
            href={ROUTES.MILLS.LIST}
          />
        </SuperAdminGate>

        <PermissionGate module="beam_qualities" action="view">
          <ModuleCard
            icon={<Layers className="size-6 text-primary" />}
            title="Beam Qualities"
            description="Define beam quality standards"
            href={ROUTES.BEAM_QUALITIES.LIST}
          />
        </PermissionGate>

        <PermissionGate module="production_qualities" action="view">
          <ModuleCard
            icon={<Tag className="size-6 text-primary" />}
            title="Production Qualities"
            description="Define production quality grades"
            href={ROUTES.PRODUCTION_QUALITIES.LIST}
          />
        </PermissionGate>

        <PermissionGate module="machines" action="view">
          <ModuleCard
            icon={<Settings2 className="size-6 text-primary" />}
            title="Machines"
            description="Manage weaving machines"
            href={ROUTES.MACHINES.LIST}
          />
        </PermissionGate>

        <PermissionGate module="beams" action="view">
          <ModuleCard
            icon={<AlignLeft className="size-6 text-primary" />}
            title="Beams"
            description="Manage beam records"
            href={ROUTES.BEAMS.LIST}
          />
        </PermissionGate>

        <PermissionGate module="production" action="view">
          <ModuleCard
            icon={<ClipboardList className="size-6 text-primary" />}
            title="Production"
            description="Log production information"
            href={ROUTES.PRODUCTION.LIST}
          />
        </PermissionGate>

        <PermissionGate module="takas" action="view">
          <ModuleCard
            icon={<ScrollText className="size-6 text-primary" />}
            title="Takas"
            description="View auto-generated takas"
            href={ROUTES.TAKAS.LIST}
          />
        </PermissionGate>

        <PermissionGate module="mill_outverts" action="view">
          <ModuleCard
            icon={<ArrowUpFromLine className="size-6 text-primary" />}
            title="Mill Outverts"
            description="Record mill outvert challans"
            href={ROUTES.MILL_OUTVERTS.LIST}
          />
        </PermissionGate>

        <PermissionGate module="mill_inverts" action="view">
          <ModuleCard
            icon={<ArrowDownToLine className="size-6 text-primary" />}
            title="Mill Inverts"
            description="Record mill invert returns"
            href={ROUTES.MILL_INVERTS.LIST}
          />
        </PermissionGate>

        <PermissionGate module="machine_info" action="view">
          <ModuleCard
            icon={<Activity className="size-6 text-primary" />}
            title="Machine Info"
            description="Live machine status view"
            href={ROUTES.MACHINE_INFO}
          />
        </PermissionGate>

        <PermissionGate module="mill_summary" action="view">
          <ModuleCard
            icon={<BarChart3 className="size-6 text-primary" />}
            title="Mill Summary"
            description="Mill flow status overview"
            href={ROUTES.MILL_SUMMARY}
          />
        </PermissionGate>
      </div>

      {/* Setup Guide */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-primary" />
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to set up the system in the correct order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {SETUP_STEPS.map(({ step, name, description, href }) => (
              <li key={step} className="flex items-start gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {step}
                </span>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <div>
                    <p className="font-medium leading-none">{name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="shrink-0"
                  >
                    <Link href={href}>→</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Pending User Approvals */}
      <SuperAdminGate>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              <CardTitle className="text-lg">Pending User Approvals</CardTitle>
            </div>
            <CardDescription>Users awaiting account approval.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPendingLoading ? (
              <Skeleton className="h-9 w-48" />
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {pendingData?.pagination.total ?? 0} pending
                </Badge>
                <Button asChild size="sm">
                  <Link href={ROUTES.ADMIN.PENDING_USERS}>
                    Review Approvals
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </SuperAdminGate>
    </div>
  );
}

type ModuleCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

function ModuleCard({ icon, title, description, href }: ModuleCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        {icon}
        <CardTitle className="mt-2 text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto pt-0">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={href}>Open</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
