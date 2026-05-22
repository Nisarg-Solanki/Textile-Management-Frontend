"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnOrderState,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Columns,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  caption?: string;
  getRowClassName?: (row: Row<T>) => string;
  toolbar?: ReactNode;
  // Stable id for persisting column order to localStorage. Omit to disable persistence.
  tableId?: string;
  // Refetch callback for the refresh button. Spinner shown while the returned promise pends.
  onRefresh?: () => void | Promise<unknown>;
  // Infinite scroll mode — when provided, replaces pagination footer with a
  // sentinel that triggers fetchNextPage when scrolled into view.
  infiniteScroll?: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    totalCount?: number;
  };
  // Show row index as the first column (default: true)
  showRowIndex?: boolean;
};

function storageKey(tableId: string) {
  return `dt:order:${tableId}`;
}

function loadOrder(tableId: string | undefined, ids: string[]): ColumnOrderState {
  if (!tableId || typeof window === "undefined") return ids;
  try {
    const raw = window.localStorage.getItem(storageKey(tableId));
    if (!raw) return ids;
    const saved = JSON.parse(raw) as unknown;
    if (!Array.isArray(saved)) return ids;
    const known = new Set(ids);
    const filtered = saved.filter((id): id is string => typeof id === "string" && known.has(id));
    const missing = ids.filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
  } catch {
    return ids;
  }
}

function getColumnLabel<T>(col: Column<T, unknown>): string {
  const header = col.columnDef.header;
  if (typeof header === "string") return header;
  return col.id
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
}

const SKELETON_COUNT = 5;

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  caption,
  getRowClassName,
  toolbar,
  tableId,
  onRefresh,
  infiniteScroll,
  showRowIndex = true,
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const indexColumn: ColumnDef<T> | null = useMemo(() => {
    if (!showRowIndex) return null;
    return {
      id: "__index__",
      header: "#",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
      size: 40,
    };
  }, [showRowIndex]);

  const displayColumns = useMemo(() => {
    return indexColumn ? [indexColumn, ...columns] : columns;
  }, [indexColumn, columns]);

  const allColumnIds = useMemo(
    () => displayColumns.map((c, i) => (c.id ?? ("accessorKey" in c ? String(c.accessorKey) : `col-${i}`))),
    [displayColumns],
  );

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    loadOrder(tableId, allColumnIds),
  );

  useEffect(() => {
    setColumnOrder((prev) => {
      const known = new Set(allColumnIds);
      const filtered = prev.filter((id) => known.has(id));
      const missing = allColumnIds.filter((id) => !filtered.includes(id));
      const next = [...filtered, ...missing];
      if (
        next.length === prev.length &&
        next.every((id, i) => id === prev[i])
      ) {
        return prev;
      }
      return next;
    });
  }, [allColumnIds]);

  useEffect(() => {
    if (!tableId || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(tableId), JSON.stringify(columnOrder));
    } catch {
      // ignore quota errors
    }
  }, [tableId, columnOrder]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  const moveColumn = useCallback((id: string, direction: -1 | 1) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

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

  const table = useReactTable({
    data,
    columns: displayColumns,
    state: { sorting, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  });

  const visibleLeafColumns = table.getVisibleLeafColumns();
  const skeletonRows = Array.from({ length: SKELETON_COUNT }, (_, i) => i);
  const skeletonCells = Array.from(
    { length: visibleLeafColumns.length },
    (_, i) => i,
  );
  const displayColumnsLength = displayColumns.length;

  const orderedColumns = table.getAllLeafColumns();
  const reorderableColumns = orderedColumns.filter((col) => col.id !== "__index__");
  const columnsDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Columns className="size-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {reorderableColumns.map((col, index) => {
          const canHide = col.getCanHide();
          return (
            <div
              key={col.id}
              className="flex items-center gap-1 px-2 py-1 text-sm"
            >
              {canHide ? (
                <DropdownMenuCheckboxItem
                  className="flex-1 m-0"
                  checked={col.getIsVisible()}
                  onCheckedChange={(checked) => col.toggleVisibility(checked)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {getColumnLabel(col)}
                </DropdownMenuCheckboxItem>
              ) : (
                <span className="flex-1 pl-8 pr-2 text-muted-foreground">
                  {getColumnLabel(col)}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                aria-label="Move column up"
                disabled={index === 0}
                onClick={(e) => {
                  e.preventDefault();
                  moveColumn(col.id, -1);
                }}
              >
                <ArrowUp className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                aria-label="Move column down"
                disabled={index === reorderableColumns.length - 1}
                onClick={(e) => {
                  e.preventDefault();
                  moveColumn(col.id, 1);
                }}
              >
                <ArrowDown className="size-3" />
              </Button>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const refreshButton = onRefresh ? (
    <Button
      variant="outline"
      size="icon"
      className="shrink-0 size-9"
      aria-label="Refresh"
      disabled={isRefreshing}
      onClick={handleRefresh}
    >
      <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
    </Button>
  ) : null;

  return (
    <div className="space-y-4">
      {/* Toolbar: search/filters on the left, columns toggle on the right */}
      <div className="flex flex-wrap items-center gap-3">
        {toolbar && (
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {toolbar}
          </div>
        )}
        <div className={cn("flex items-center gap-2", !toolbar && "ml-auto")}>
          {refreshButton}
          {columnsDropdown}
        </div>
      </div>

      {/* Mobile: stacked cards — hidden at md+ */}
      <div className="md:hidden space-y-3">
        {isLoading
          ? skeletonRows.map((i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  {Array.from({ length: displayColumnsLength }).map((_, j) => (
                    <div key={j} className="flex justify-between gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          : table.getRowModel().rows.map((row) => (
              <Card key={row.id} className={getRowClassName?.(row)}>
                <CardContent className="pt-4 space-y-2">
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="font-medium text-muted-foreground shrink-0">
                        {getColumnLabel(cell.column)}
                      </span>
                      <span className="text-right break-all">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Desktop: standard table — visible at md+ */}
      <div className="hidden md:block rounded-md border">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="size-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronsUpDown className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonRows.map((i) => (
                <TableRow key={i}>
                  {skeletonCells.map((j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumnsLength}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(getRowClassName?.(row))}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Infinite scroll sentinel + status — takes precedence over pagination footer */}
      {infiniteScroll ? (
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
      ) : (
        pagination && (
          <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
            <div className="text-center md:text-left">
              <span className="font-medium text-foreground block mb-1">
                Total Records: {pagination.total}
              </span>
              <span className="text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>
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
        )
      )}
    </div>
  );
}
