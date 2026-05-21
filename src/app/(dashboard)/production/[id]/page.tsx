"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getProduction } from "@/lib/api/production";
import { formatDate } from "@/lib/utils/formatDate";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { ROUTES } from "@/lib/routes";
import type { ProductionInfo } from "@/lib/api/production";
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

function MillStatusBadge({ record }: { record: ProductionInfo }) {
  if (!record.millOutvertDate) {
    return <Badge variant="secondary">Not Sent</Badge>;
  }
  if (record.millOutvertDate && !record.millInvertId) {
    return <Badge className="bg-amber-100 text-amber-800">At Mill</Badge>;
  }
  return <Badge className="bg-green-100 text-green-800">Returned</Badge>;
}

export default function ProductionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: record, isLoading } = useQuery({
    queryKey: ["production", id],
    queryFn: () => getProduction(id),
  });

  return (
    <PermissionGate module="production" action="view">
      <PageHeader title="Production Detail" backHref={ROUTES.PRODUCTION.LIST}>
        <PermissionGate module="production" action="edit">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => router.push(ROUTES.PRODUCTION.EDIT(id))}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Production Info</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DetailSkeleton rows={11} />
            ) : record ? (
              <>
                <DetailRow label="Date" value={formatDate(record.entryDate)} />
                <DetailRow label="Challan No" value={record.productionChallanNo ?? "—"} />
                <DetailRow label="Sr. No." value={record.takaSrNo} />
                <DetailRow label="M/C No." value={record.machine?.machineNo ?? "—"} />
                <DetailRow label="Taka No." value={record.takaNo} />
                <DetailRow label="Mtrs." value={formatDecimal(record.takaMeter)} />
                <DetailRow label="Beam No." value={record.beam?.beamNo ?? "—"} />
                <DetailRow label="Quality" value={record.productionQuality?.name ?? "—"} />
                <DetailRow label="Wt." value={formatDecimal(record.weight)} />
                <DetailRow label="Remark" value={record.remark ?? "—"} />
                <DetailRow label="Firm" value={record.firm?.firmName ?? "—"} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mill Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DetailSkeleton rows={4} />
            ) : record ? (
              <>
                <DetailRow
                  label="Mill Status"
                  value={<MillStatusBadge record={record} />}
                />
                <DetailRow
                  label="Mill Outvert Date"
                  value={
                    record.millOutvertDate
                      ? formatDate(record.millOutvertDate)
                      : "—"
                  }
                />
                <DetailRow
                  label="Mill Challan No"
                  value={record.millChallanNo ?? "—"}
                />
                <DetailRow label="Mill Name" value={record.millName ?? "—"} />
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
