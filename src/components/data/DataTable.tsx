"use client";

import { useState } from "react";
import {
  type Column,
  type ColumnDef,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Columns } from "lucide-react";
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
};

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
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
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

  const columnsDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Columns className="size-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((col) => col.getCanHide())
          .map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={col.getIsVisible()}
              onCheckedChange={(checked) => col.toggleVisibility(checked)}
            >
              {getColumnLabel(col)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar: search/filters on the left, columns toggle on the right */}
      <div className="flex flex-wrap items-center gap-3">
        {toolbar && (
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {toolbar}
          </div>
        )}
        <div className={cn(!toolbar && "ml-auto")}>{columnsDropdown}</div>
      </div>

      {/* Mobile: stacked cards — hidden at md+ */}
      <div className="md:hidden space-y-3">
        {isLoading
          ? skeletonRows.map((i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  {columns.map((_, j) => (
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
                  colSpan={columns.length}
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

      {/* Pagination */}
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
