"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { getFirm } from "@/lib/api/firms";
import { ROUTES } from "@/lib/routes";
import type { Firm } from "@/types/app";

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm sm:text-right">{value ?? "—"}</span>
    </div>
  );
}

function FirmDetailSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }, (_, i) => (
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

function FirmDetailContent({ firm }: { firm: Firm }) {
  return (
    <>
      <DetailRow label="Firm Name" value={firm.firmName} />
      <DetailRow label="Firm Code" value={firm.firmCode} />
      <DetailRow
        label="Challan Enable"
        value={
          <Badge variant={firm.challanEnable ? "default" : "secondary"}>
            {firm.challanEnable ? "Yes" : "No"}
          </Badge>
        }
      />
      <DetailRow label="Sr. No. Series" value={firm.srNoSeries} />
      <DetailRow label="Address" value={firm.address} />
      <DetailRow label="Contact Person" value={firm.contactPerson} />
      <DetailRow label="Contact Number" value={firm.contactNumber} />
      <DetailRow
        label="Status"
        value={
          <Badge variant={firm.status === "active" ? "default" : "secondary"}>
            {firm.status === "active" ? "Active" : "Inactive"}
          </Badge>
        }
      />
    </>
  );
}

export default function FirmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: firm, isLoading } = useQuery({
    queryKey: ["firms", id],
    queryFn: () => getFirm(id),
  });

  return (
    <SuperAdminGate>
      <PageHeader
        title={isLoading ? "Loading..." : (firm?.firmName ?? "Firm Details")}
        onBack={() => router.back()}
      >
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => router.push(ROUTES.FIRMS.EDIT(id))}
        >
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <FirmDetailSkeleton />
          ) : firm ? (
            <FirmDetailContent firm={firm} />
          ) : null}
        </CardContent>
      </Card>
    </SuperAdminGate>
  );
}
