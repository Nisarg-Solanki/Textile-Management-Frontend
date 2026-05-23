"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/routes";
import type {
  MillSummaryProduction,
  MillSummaryRow,
} from "@/lib/api/millSummary";

type ChallanStatus =
  | "returned"
  | "at_mill"
  | "not_sent"
  | "partial_return"
  | "partial";
type TakaStatus = "returned" | "at_mill" | "not_sent";

function deriveTakaStatus(p: MillSummaryProduction): TakaStatus {
  if (p.millInvertId) return "returned";
  if (p.millOutvertId) return "at_mill";
  return "not_sent";
}

function deriveChallanStatus(row: MillSummaryRow): ChallanStatus {
  const prods = row.productions;
  if (!prods.length) return "not_sent";

  const returnedCount = prods.filter((p) => !!p.millInvertId).length;
  const notSentCount = prods.filter((p) => !p.millOutvertId).length;

  if (returnedCount === prods.length) return "returned";
  if (notSentCount === prods.length) return "not_sent";
  if (prods.every((p) => p.millOutvertId && !p.millInvertId)) return "at_mill";
  // some not sent at all
  if (notSentCount > 0) return "partial";
  // all have outvert but mix of returned/at-mill
  return "partial_return";
}

const CHALLAN_STATUS_CONFIG: Record<
  ChallanStatus,
  { label: string; badgeClass: string; rowClass: string }
> = {
  returned: {
    label: "Returned",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rowClass: "bg-green-50 dark:bg-green-950/20",
  },
  at_mill: {
    label: "At Mill",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    rowClass: "bg-amber-50 dark:bg-amber-950/20",
  },
  not_sent: {
    label: "Not Sent",
    badgeClass: "",
    rowClass: "",
  },
  partial_return: {
    label: "Partial Return",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    rowClass: "bg-blue-50 dark:bg-blue-950/20",
  },
  partial: {
    label: "Partial",
    badgeClass:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    rowClass: "bg-orange-50 dark:bg-orange-950/20",
  },
};

const TAKA_STATUS_CONFIG: Record<
  TakaStatus,
  { label: string; badgeClass: string }
> = {
  returned: {
    label: "Returned",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  at_mill: {
    label: "At Mill",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  not_sent: {
    label: "Not Sent",
    badgeClass: "",
  },
};

type Props = {
  data: MillSummaryRow[];
  isLoading?: boolean;
  toolbar?: ReactNode;
  infiniteScroll?: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    totalCount?: number;
  };
};

const SKELETON_COUNT = 5;
const PARENT_COL_COUNT = 10;

export function MillSummaryTable({
  data,
  isLoading,
  toolbar,
  infiniteScroll,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  function toggleRow(key: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  useEffect(() => {
    if (!infiniteScroll) return;
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = infiniteScroll;
    if (!hasNextPage) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
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
        <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Firm Challan No</TableHead>
              <TableHead>Firm</TableHead>
              <TableHead>Mill</TableHead>
              <TableHead>Outvert Date</TableHead>
              <TableHead>Mill Challan No</TableHead>
              <TableHead>Invert Date</TableHead>
              <TableHead>Takas</TableHead>
              <TableHead>Challan Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: PARENT_COL_COUNT }, (_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={PARENT_COL_COUNT}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => {
                const challanStatus = deriveChallanStatus(row);
                const config = CHALLAN_STATUS_CONFIG[challanStatus];
                const key = row.firmChallanNo || String(idx);
                const isExpanded = expandedRows.has(key);

                return (
                  <Fragment key={key}>
                    <TableRow
                      className={cn("cursor-pointer", config.rowClass)}
                      onClick={() => toggleRow(key)}
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.firmChallanNo || "—"}
                      </TableCell>
                      <TableCell>{row.firm?.firmName ?? "—"}</TableCell>
                      <TableCell>{row.mill?.millName ?? "—"}</TableCell>
                      <TableCell>
                        {row.outvertDate ? formatDate(row.outvertDate) : "—"}
                      </TableCell>
                      <TableCell>{row.millChallanNo || "—"}</TableCell>
                      <TableCell>
                        {row.invertDate ? formatDate(row.invertDate) : "—"}
                      </TableCell>
                      <TableCell>
                        {row.takaCount ?? row.productions.length}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            challanStatus === "not_sent"
                              ? "secondary"
                              : "outline"
                          }
                          className={config.badgeClass}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className={cn(config.rowClass)}>
                        <TableCell
                          colSpan={PARENT_COL_COUNT}
                          className="p-0 border-t"
                        >
                          <div className="px-10 py-3 bg-muted/30">
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                              Productions in this challan
                            </p>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-8">#</TableHead>
                                  <TableHead>Taka Sr No</TableHead>
                                  <TableHead>Machine</TableHead>
                                  <TableHead>Beam No</TableHead>
                                  <TableHead>Quality</TableHead>
                                  <TableHead>Taka Meter</TableHead>
                                  <TableHead>Outvert Date</TableHead>
                                  <TableHead>Invert Date</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {row.productions.map((prod, pidx) => {
                                  const takaStatus = deriveTakaStatus(prod);
                                  const takaConfig =
                                    TAKA_STATUS_CONFIG[takaStatus];
                                  return (
                                    <TableRow key={prod.id}>
                                      <TableCell className="text-xs text-muted-foreground">
                                        {pidx + 1}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        <Link
                                          href={ROUTES.TAKAS.DETAIL(
                                            prod.taka.id,
                                          )}
                                          className="text-primary hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {prod.takaSrNo}
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                        {prod.machine?.machineNo ?? "—"}
                                      </TableCell>
                                      <TableCell>
                                        {prod.beam?.beamNo ?? "—"}
                                      </TableCell>
                                      <TableCell>
                                        {prod.productionQuality?.name ?? "—"}
                                      </TableCell>
                                      <TableCell>{prod.takaMeter}</TableCell>
                                      <TableCell>
                                        {prod.millOutvert?.outvertDate
                                          ? formatDate(
                                              prod.millOutvert.outvertDate,
                                            )
                                          : "—"}
                                      </TableCell>
                                      <TableCell>
                                        {prod.millInvert?.invertDate
                                          ? formatDate(
                                              prod.millInvert.invertDate,
                                            )
                                          : "—"}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            takaStatus === "not_sent"
                                              ? "secondary"
                                              : "outline"
                                          }
                                          className={takaConfig.badgeClass}
                                        >
                                          {takaConfig.label}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <div key={j} className="flex justify-between gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          : data.map((row, idx) => {
              const challanStatus = deriveChallanStatus(row);
              const config = CHALLAN_STATUS_CONFIG[challanStatus];
              const key = row.firmChallanNo || String(idx);
              const isExpanded = expandedRows.has(key);

              return (
                <Card
                  key={key}
                  className={cn("cursor-pointer", config.rowClass)}
                  onClick={() => toggleRow(key)}
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium">
                        {row.firmChallanNo || "—"}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            challanStatus === "not_sent"
                              ? "secondary"
                              : "outline"
                          }
                          className={config.badgeClass}
                        >
                          {config.label}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Firm</span>
                      <span className="text-right">
                        {row.firm?.firmName ?? "—"}
                      </span>
                      <span className="text-muted-foreground">Mill</span>
                      <span className="text-right">
                        {row.mill?.millName ?? "—"}
                      </span>
                      <span className="text-muted-foreground">
                        Outvert Date
                      </span>
                      <span className="text-right">
                        {row.outvertDate ? formatDate(row.outvertDate) : "—"}
                      </span>
                      <span className="text-muted-foreground">
                        Mill Challan No
                      </span>
                      <span className="text-right">
                        {row.millChallanNo || "—"}
                      </span>
                      <span className="text-muted-foreground">Invert Date</span>
                      <span className="text-right">
                        {row.invertDate ? formatDate(row.invertDate) : "—"}
                      </span>
                      <span className="text-muted-foreground">Takas</span>
                      <span className="text-right">
                        {row.takaCount ?? row.productions.length}
                      </span>
                    </div>

                    {isExpanded && row.productions.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Productions
                        </p>
                        {row.productions.map((prod) => {
                          const takaStatus = deriveTakaStatus(prod);
                          const takaConfig = TAKA_STATUS_CONFIG[takaStatus];
                          return (
                            <div
                              key={prod.id}
                              className="bg-background/60 rounded-md p-3 space-y-1.5 text-sm"
                            >
                              <div className="flex justify-between items-center">
                                <Link
                                  href={ROUTES.TAKAS.DETAIL(prod.taka.id)}
                                  className="font-medium text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {prod.takaSrNo}
                                </Link>
                                <Badge
                                  variant={
                                    takaStatus === "not_sent"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={takaConfig.badgeClass}
                                >
                                  {takaConfig.label}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                                <span>
                                  Machine: {prod.machine?.machineNo ?? "—"}
                                </span>
                                <span>Beam: {prod.beam?.beamNo ?? "—"}</span>
                                <span>
                                  Outvert:{" "}
                                  {prod.millOutvert?.outvertDate
                                    ? formatDate(prod.millOutvert.outvertDate)
                                    : "—"}
                                </span>
                                <span>
                                  Invert:{" "}
                                  {prod.millInvert?.invertDate
                                    ? formatDate(prod.millInvert.invertDate)
                                    : "—"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Infinite scroll sentinel */}
      {infiniteScroll && (
        <div className="flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground">
          {infiniteScroll.isFetchingNextPage && (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Loading more...
            </div>
          )}
          <div className="text-center">
            {typeof infiniteScroll.totalCount === "number" && (
              <span className="font-medium text-foreground">
                Total Records: {infiniteScroll.totalCount}
              </span>
            )}
            {!infiniteScroll.hasNextPage && data.length > 0 && (
              <div className="mt-1 text-muted-foreground text-xs">
                {typeof infiniteScroll.totalCount === "number"
                  ? `All records loaded (${infiniteScroll.totalCount})`
                  : "End of list"}
              </div>
            )}
          </div>
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        </div>
      )}
    </div>
  );
}
