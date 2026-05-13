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
import { getMill } from "@/lib/api/mills";
import { ROUTES } from "@/lib/routes";
import type { Mill } from "@/types/app";

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

function MillDetailSkeleton() {
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

function MillDetailContent({ mill }: { mill: Mill }) {
  return (
    <>
      <DetailRow label="Mill Name" value={mill.millName} />
      <DetailRow label="Mill Code" value={mill.millCode} />
      <DetailRow label="Address" value={mill.address} />
      <DetailRow label="Contact Person" value={mill.contactPerson} />
      <DetailRow label="Contact Number" value={mill.contactNumber} />
      <DetailRow
        label="Status"
        value={
          <Badge variant={mill.status === "active" ? "default" : "secondary"}>
            {mill.status === "active" ? "Active" : "Inactive"}
          </Badge>
        }
      />
    </>
  );
}

export default function MillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: mill, isLoading } = useQuery({
    queryKey: ["mills", id],
    queryFn: () => getMill(id),
  });

  return (
    <SuperAdminGate>
      <PageHeader
        title={isLoading ? "Loading..." : (mill?.millName ?? "Mill Details")}
        backHref={ROUTES.MILLS.LIST}
      >
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => router.push(ROUTES.MILLS.EDIT(id))}
        >
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <MillDetailSkeleton />
          ) : mill ? (
            <MillDetailContent mill={mill} />
          ) : null}
        </CardContent>
      </Card>
    </SuperAdminGate>
  );
}
