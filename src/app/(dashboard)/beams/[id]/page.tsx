"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getBeam } from "@/lib/api/beams";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { ROUTES } from "@/lib/routes";
import type { Beam } from "@/lib/api/beams";
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

function BeamDetailSkeleton() {
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

function BeamDetailContent({ beam }: { beam: Beam }) {
  return (
    <>
      <DetailRow label="Beam No" value={beam.beamNo} />
      <DetailRow label="Firm" value={beam.firm?.firmName} />
      <DetailRow label="Quality" value={beam.beamQuality?.name} />
      <DetailRow label="Tar" value={beam.tar} />
      <DetailRow label="Taka Quantity" value={beam.takaQty} />
      <DetailRow label="Beam Meter" value={formatDecimal(beam.beamMeter)} />
    </>
  );
}

export default function BeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: beam, isLoading } = useQuery({
    queryKey: ["beam", id],
    queryFn: () => getBeam(id),
  });

  return (
    <PermissionGate module="beams" action="view">
      <PageHeader
        title={isLoading ? "Loading..." : (beam?.beamNo ?? "Beam Details")}
        backHref={ROUTES.BEAMS.LIST}
      >
        <PermissionGate module="beams" action="edit">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => router.push(ROUTES.BEAMS.EDIT(id))}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        </PermissionGate>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <BeamDetailSkeleton />
          ) : beam ? (
            <BeamDetailContent beam={beam} />
          ) : null}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
