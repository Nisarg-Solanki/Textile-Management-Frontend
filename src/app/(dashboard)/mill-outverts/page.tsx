"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data/DataTable";
import { SearchBar } from "@/components/data/SearchBar";
import { FilterPanel } from "@/components/data/FilterPanel";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { DateRangeFilter } from "@/components/data/DateRangeFilter";
import { FirmFilter } from "@/components/data/FirmFilter";
import { getMillOutverts } from "@/lib/api/millOutverts";
import { useFirms } from "@/lib/hooks/useFirms";
import { deleteMillOutvertAction } from "@/lib/actions/millOutverts.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
import type { MillOutvert } from "@/lib/api/millOutverts";

const LIMIT = 20;

export default function MillOutvertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const millId = searchParams.get("millId") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;
  const date_from = searchParams.get("date_from") ?? undefined;
  const date_to = searchParams.get("date_to") ?? undefined;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<MillOutvert, {
      search?: string;
      millId?: string;
      firmId?: string;
      date_from?: string;
      date_to?: string;
    }>({
      queryKey: ["mill-outverts"],
      params: { search, millId, firmId, date_from, date_to },
      limit: LIMIT,
      fetcher: getMillOutverts,
    });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  const millOptions = Array.from(
    new Map(
      items
        .filter((mo) => mo.mill)
        .map((mo) => [mo.millId, { id: mo.millId, millName: mo.mill!.millName }])
    ).values()
  ).map((m) => ({ value: m.id, label: m.millName }));

  const deleteRecord = items.find((r) => r.id === deleteId);

  function handleMillChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("millId");
    } else {
      params.set("millId", value);
    }
    router.push(`?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteMillOutvertAction(deleteId);
      toast.success("Mill outvert deleted");
      await queryClient.invalidateQueries({ queryKey: ["mill-outverts"] });
      setDeleteId(null);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<MillOutvert>[]>(
    () => [
      {
        id: "outvertDate",
        header: "Outvert Date",
        cell: ({ row }) => formatDate(row.original.outvertDate),
      },
      {
        accessorKey: "firmChallanNo",
        header: "Firm Challan No",
      },
      {
        id: "mill",
        header: "Mill",
        cell: ({ row }) => row.original.mill?.millName ?? "—",
      },
      {
        id: "firm",
        header: "Firm",
        cell: ({ row }) => row.original.firm?.firmName ?? "—",
      },
      {
        id: "takaCount",
        header: "Taka Count",
        cell: ({ row }) => row.original.outvertTakas?.length ?? 0,
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View mill outvert"
                onClick={() => router.push(ROUTES.MILL_OUTVERTS.DETAIL(record.id))}
              >
                <Eye className="size-4" />
              </Button>
              <PermissionGate module="mill_outverts" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit mill outvert"
                  onClick={() => router.push(ROUTES.MILL_OUTVERTS.EDIT(record.id))}
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="mill_outverts" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete mill outvert"
                  onClick={() => setDeleteId(record.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </PermissionGate>
            </div>
          );
        },
      },
    ],
    [router],
  );

  return (
    <PermissionGate module="mill_outverts" action="view">
      <PageHeader
        title="Mill Outverts"
        filter={<FirmFilter options={firmOptions} isLoading={firmsLoading} />}
      >
        <PermissionGate module="mill_outverts" action="create">
          <Button size="sm" onClick={() => router.push(ROUTES.MILL_OUTVERTS.NEW)}>
            <Plus className="mr-1.5 size-4" />
            Add Mill Outvert
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          tableId="mill-outverts"
          onRefresh={refetch}
          columns={columns}
          data={items}
          isLoading={isLoading}
          infiniteScroll={{
            hasNextPage,
            isFetchingNextPage,
            fetchNextPage,
            totalCount,
          }}
          toolbar={
            <>
              <SearchBar placeholder="Search mill outverts..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Mill
                    </span>
                    <Select
                      value={searchParams.get("millId") ?? "all"}
                      onValueChange={handleMillChange}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Mills</SelectItem>
                        {millOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DateRangeFilter />
                </div>
              </FilterPanel>
            </>
          }
        />
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete Mill Outvert"
        description={
          deleteRecord
            ? `Are you sure you want to delete mill outvert with challan "${deleteRecord.firmChallanNo}"? This action cannot be undone.`
            : "Are you sure you want to delete this mill outvert? This action cannot be undone."
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PermissionGate>
  );
}
