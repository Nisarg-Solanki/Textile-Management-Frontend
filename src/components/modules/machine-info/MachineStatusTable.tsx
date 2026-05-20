"use client";

import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/data/EmptyState";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { cn } from "@/lib/utils/cn";
import type { MachineInfoRow } from "@/lib/api/machineInfo";

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Props = {
  data: MachineInfoRow[];
  isLoading?: boolean;
  toolbar?: ReactNode;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
};

const SKELETON_COUNT = 3;

export function MachineStatusTable({
  data,
  isLoading,
  toolbar,
  pagination,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-4">
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {toolbar}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <EmptyState
          icon={Activity}
          title="No machines found"
          description="No machine info is available for the current filters."
        />
      )}

      {!isLoading && data.length > 0 && (
        <div className="space-y-4">
          {data.map((machine) => (
            <Card key={machine.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {machine.machineNo}
                      </h3>
                      <span className="text-muted-foreground text-sm">
                        · {machine.machineType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {machine.firm.firmName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      machine.status === "active" ? "default" : "secondary"
                    }
                    className="shrink-0 capitalize"
                  >
                    {machine.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {machine.beams.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No beams assigned.
                  </p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[160px]">Beam No</TableHead>
                          <TableHead className="w-[140px]">
                            Beam Meter
                          </TableHead>
                          <TableHead className="w-[160px]">
                            Taka Sr No
                          </TableHead>
                          <TableHead>Taka Meter</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {machine.beams.map((beam, beamIdx) => {
                          if (beam.takas.length === 0) {
                            return (
                              <TableRow
                                key={beam.id}
                                className={cn(
                                  beamIdx > 0 &&
                                    "border-t-2 border-muted/60",
                                )}
                              >
                                <TableCell className="font-medium">
                                  {beam.beamNo}
                                </TableCell>
                                <TableCell>
                                  {formatDecimal(beam.beamMeter)} m
                                </TableCell>
                                <TableCell
                                  colSpan={2}
                                  className="text-muted-foreground text-sm italic"
                                >
                                  No takas
                                </TableCell>
                              </TableRow>
                            );
                          }

                          return beam.takas.map((taka, takaIdx) => (
                            <TableRow
                              key={taka.id}
                              className={cn(
                                takaIdx === 0 &&
                                  beamIdx > 0 &&
                                  "border-t-2 border-muted/60",
                              )}
                            >
                              {takaIdx === 0 && (
                                <>
                                  <TableCell
                                    rowSpan={beam.takas.length}
                                    className="font-medium align-top"
                                  >
                                    {beam.beamNo}
                                  </TableCell>
                                  <TableCell
                                    rowSpan={beam.takas.length}
                                    className="align-top"
                                  >
                                    {formatDecimal(beam.beamMeter)} m
                                  </TableCell>
                                </>
                              )}
                              <TableCell>{taka.takaSrNo}</TableCell>
                              <TableCell>
                                {formatDecimal(taka.takaMeter)} m
                              </TableCell>
                            </TableRow>
                          ));
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages} &mdash;{" "}
            {pagination.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
