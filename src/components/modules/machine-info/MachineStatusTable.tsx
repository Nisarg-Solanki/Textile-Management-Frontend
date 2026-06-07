"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Activity, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

type Props = {
  data: MachineInfoRow[];
  isLoading?: boolean;
  toolbar?: ReactNode;
  infiniteScroll?: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    totalCount?: number;
  };
};

const SKELETON_COUNT = 3;

export function MachineStatusTable({
  data,
  isLoading,
  toolbar,
  infiniteScroll,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!infiniteScroll) return;
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = infiniteScroll;
    if (!hasNextPage) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [infiniteScroll]);
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
                          <TableHead className="w-[120px]">
                            Total Meter
                          </TableHead>
                          <TableHead className="w-[100px]">
                            Taka Count
                          </TableHead>
                          <TableHead className="w-[160px]">
                            Taka Sr No
                          </TableHead>
                          <TableHead className="w-[140px]">Taka No</TableHead>
                          <TableHead>Taka Meter</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {machine.beams.map((beam, beamIdx) => {
                          const takaCount = beam.takas.length;
                          const totalMeter = beam.takas.reduce(
                            (sum, t) => sum + parseFloat(t.takaMeter || "0"),
                            0,
                          );

                          if (takaCount === 0) {
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
                                <TableCell className="text-muted-foreground text-sm">
                                  —
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  0
                                </TableCell>
                                <TableCell
                                  colSpan={3}
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
                                    rowSpan={takaCount}
                                    className="font-medium align-top"
                                  >
                                    {beam.beamNo}
                                  </TableCell>
                                  <TableCell
                                    rowSpan={takaCount}
                                    className="align-top"
                                  >
                                    {formatDecimal(beam.beamMeter)} m
                                  </TableCell>
                                  <TableCell
                                    rowSpan={takaCount}
                                    className="align-top font-medium text-primary"
                                  >
                                    {formatDecimal(String(totalMeter))} m
                                  </TableCell>
                                  <TableCell
                                    rowSpan={takaCount}
                                    className="align-top font-medium"
                                  >
                                    <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                                      {takaCount}
                                    </span>
                                  </TableCell>
                                </>
                              )}
                              <TableCell>{taka.takaSrNo}</TableCell>
                              <TableCell>{taka.takaNo}</TableCell>
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

      {infiniteScroll && (
        <div className="flex flex-col items-center gap-2 py-2 text-sm text-muted-foreground">
          {infiniteScroll.isFetchingNextPage && (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Loading more...
            </div>
          )}
          {!infiniteScroll.hasNextPage && data.length > 0 && (
            <span>
              {typeof infiniteScroll.totalCount === "number"
                ? `All ${infiniteScroll.totalCount} loaded`
                : "End of list"}
            </span>
          )}
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        </div>
      )}
    </div>
  );
}
