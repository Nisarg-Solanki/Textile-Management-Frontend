"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getMillInvert } from "@/lib/api/millInverts";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
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

export default function MillInvertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: record, isLoading } = useQuery({
    queryKey: ["mill-invert", id],
    queryFn: () => getMillInvert(id),
  });

  return (
    <PermissionGate module="mill_inverts" action="view">
      <PageHeader title="Mill Invert Detail" backHref={ROUTES.MILL_INVERTS.LIST}>
        <PermissionGate module="mill_inverts" action="edit">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => router.push(ROUTES.MILL_INVERTS.EDIT(id))}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invert Info</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DetailSkeleton rows={6} />
            ) : record ? (
              <>
                <DetailRow
                  label="Invert Date"
                  value={formatDate(record.invertDate)}
                />
                <DetailRow
                  label="Mill Challan No"
                  value={record.millChallanNo}
                />
                <DetailRow
                  label="Firm Challan No"
                  value={record.firmChallanNo}
                />
                <DetailRow label="Mill" value={record.mill?.millName} />
                <DetailRow label="Firm" value={record.firm?.firmName} />
                <DetailRow
                  label="Mill Outvert"
                  value={record.millOutvert?.firmChallanNo}
                />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taka List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : record?.invertTakas && record.invertTakas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Taka Sr No</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.invertTakas.map((taka, index) => (
                    <TableRow key={taka.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>{taka.takaSrNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No takas linked.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
