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
import { getMillInverts } from "@/lib/api/millInverts";
import { useFirms } from "@/lib/hooks/useFirms";
import { deleteMillInvertAction } from "@/lib/actions/millInverts.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
import type { MillInvert } from "@/lib/api/millInverts";

const LIMIT = 20;

export default function MillInvertsPage() {
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
    useInfiniteList<MillInvert, {
      search?: string;
      millId?: string;
      firmId?: string;
      date_from?: string;
      date_to?: string;
    }>({
      queryKey: ["mill-inverts"],
      params: { search, millId, firmId, date_from, date_to },
      limit: LIMIT,
      fetcher: getMillInverts,
    });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  const millOptions = Array.from(
    new Map(
      items
        .filter((mi) => mi.mill)
        .map((mi) => [mi.millId, { id: mi.millId, millName: mi.mill!.millName }])
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
      await deleteMillInvertAction(deleteId);
      toast.success("Mill invert deleted");
      await queryClient.invalidateQueries({ queryKey: ["mill-inverts"] });
      setDeleteId(null);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<MillInvert>[]>(
    () => [
      {
        id: "invertDate",
        header: "Invert Date",
        cell: ({ row }) => formatDate(row.original.invertDate),
      },
      {
        accessorKey: "millChallanNo",
        header: "Mill Challan No",
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
        cell: ({ row }) => row.original.invertTakas?.length ?? 0,
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
                aria-label="View mill invert"
                onClick={() =>
                  router.push(ROUTES.MILL_INVERTS.DETAIL(record.id))
                }
              >
                <Eye className="size-4" />
              </Button>
              <PermissionGate module="mill_inverts" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit mill invert"
                  onClick={() =>
                    router.push(ROUTES.MILL_INVERTS.EDIT(record.id))
                  }
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="mill_inverts" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete mill invert"
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
    <PermissionGate module="mill_inverts" action="view">
      <PageHeader
        title="Mill Inverts"
        filter={<FirmFilter options={firmOptions} isLoading={firmsLoading} />}
      >
        <PermissionGate module="mill_inverts" action="create">
          <Button size="sm" onClick={() => router.push(ROUTES.MILL_INVERTS.NEW)}>
            <Plus className="mr-1.5 size-4" />
            Add Mill Invert
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          tableId="mill-inverts"
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
              <SearchBar placeholder="Search mill inverts..." className="flex-1 min-w-[180px]" />
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
        title="Delete Mill Invert"
        description={
          deleteRecord
            ? `Are you sure you want to delete mill invert with challan "${deleteRecord.millChallanNo}"? This action cannot be undone.`
            : "Are you sure you want to delete this mill invert? This action cannot be undone."
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PermissionGate>
  );
}
