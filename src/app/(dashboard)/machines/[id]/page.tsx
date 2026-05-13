"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getMachine } from "@/lib/api/machines";
import { ROUTES } from "@/lib/routes";
import type { Machine } from "@/lib/api/machines";
import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm sm:text-right">{value ?? "—"}</span>
    </div>
  );
}

function MachineDetailSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="flex justify-between border-b py-3 last:border-b-0"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

function MachineDetailContent({ machine }: { machine: Machine }) {
  return (
    <>
      <DetailRow label="Machine No" value={machine.machineNo} />
      <DetailRow label="Machine Type" value={machine.machineType} />
      <DetailRow label="Firm" value={machine.firm?.firmName} />
      <DetailRow label="Remark" value={machine.remark} />
      <DetailRow
        label="Status"
        value={
          <Badge variant={machine.status === "active" ? "default" : "secondary"}>
            {machine.status === "active" ? "Active" : "Inactive"}
          </Badge>
        }
      />
    </>
  );
}

export default function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: machine, isLoading } = useQuery({
    queryKey: ["machines", id],
    queryFn: () => getMachine(id),
  });

  return (
    <PermissionGate module="machines" action="view">
      <PageHeader
        title={isLoading ? "Loading..." : (machine?.machineNo ?? "Machine Details")}
        backHref={ROUTES.MACHINES.LIST}
      >
        <PermissionGate module="machines" action="edit">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => router.push(ROUTES.MACHINES.EDIT(id))}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        </PermissionGate>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <MachineDetailSkeleton />
          ) : machine ? (
            <MachineDetailContent machine={machine} />
          ) : null}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
