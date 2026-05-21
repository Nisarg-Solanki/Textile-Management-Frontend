"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getTaka } from "@/lib/api/takas";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
import type { Taka } from "@/lib/api/takas";
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

function DetailSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex justify-between border-b py-3 last:border-b-0">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

function TakaInfoCard({ taka }: { taka: Taka }) {
  return (
    <>
      <DetailRow label="Taka Sr No" value={taka.takaSrNo} />
      <DetailRow label="Taka No" value={taka.takaNo} />
      <DetailRow label="Meter" value={formatDecimal(taka.takaMeter)} />
      <DetailRow label="Beam No" value={taka.beam?.beamNo} />
      <DetailRow label="Firm Name" value={taka.firm?.firmName} />
      <DetailRow label="Created At" value={formatDate(taka.createdAt)} />
    </>
  );
}

function LinkedProductionCard({ taka }: { taka: Taka }) {
  const info = taka.productionInfo;
  return (
    <>
      <DetailRow
        label="Entry Date"
        value={info?.entryDate ? formatDate(info.entryDate) : undefined}
      />
      <DetailRow label="Machine No" value={info?.machine?.machineNo} />
      <DetailRow label="Quality" value={info?.productionQuality?.name} />
      <DetailRow
        label="Weight"
        value={info?.weight != null ? formatDecimal(info.weight) : undefined}
      />
    </>
  );
}

export default function TakaDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: taka, isLoading } = useQuery({
    queryKey: ["taka", id],
    queryFn: () => getTaka(id),
  });

  return (
    <PermissionGate module="takas" action="view">
      <PageHeader title="Taka Detail" backHref={ROUTES.TAKAS.LIST} />

      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taka Info</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DetailSkeleton rows={6} />
            ) : taka ? (
              <TakaInfoCard taka={taka} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked Production</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DetailSkeleton rows={4} />
            ) : taka ? (
              <LinkedProductionCard taka={taka} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
