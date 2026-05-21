"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getProductions } from "@/lib/api/production";
import { useFirms } from "@/lib/hooks/useFirms";
import { deleteProductionAction } from "@/lib/actions/production.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { formatDate } from "@/lib/utils/formatDate";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { ROUTES } from "@/lib/routes";
import type { ProductionInfo } from "@/lib/api/production";

const LIMIT = 20;

export default function ProductionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const qualityId = searchParams.get("qualityId") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;
  const date_from = searchParams.get("date_from") ?? undefined;
  const date_to = searchParams.get("date_to") ?? undefined;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<ProductionInfo, {
      search?: string;
      qualityId?: string;
      firmId?: string;
      date_from?: string;
      date_to?: string;
    }>({
      queryKey: ["production"],
      params: { search, qualityId, firmId, date_from, date_to },
      limit: LIMIT,
      fetcher: getProductions,
    });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  const qualityOptions = Array.from(
    new Map(
      items
        .filter((p) => p.productionQuality)
        .map((p) => [p.productionQuality!.id, p.productionQuality!])
    ).values()
  ).map((q) => ({ value: q.id, label: q.name }));

  const deleteRecord = items.find((r) => r.id === deleteId);

  function handleQualityChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("qualityId");
    } else {
      params.set("qualityId", value);
    }
    router.push(`?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProductionAction(deleteId);
      toast.success("Production record deleted");
      await queryClient.invalidateQueries({ queryKey: ["production"] });
      setDeleteId(null);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<ProductionInfo>[]>(
    () => [
      {
        id: "entryDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.entryDate),
      },
      {
        id: "productionChallanNo",
        header: "Challan No",
        cell: ({ row }) => row.original.productionChallanNo ?? "—",
      },
      {
        accessorKey: "takaSrNo",
        header: "Sr. No.",
      },
      {
        id: "machine",
        header: "M/C No.",
        cell: ({ row }) => row.original.machine?.machineNo ?? "—",
      },
      {
        accessorKey: "takaNo",
        header: "Taka No.",
      },
      {
        id: "takaMeter",
        header: "Mtrs.",
        cell: ({ row }) => formatDecimal(row.original.takaMeter),
      },
      {
        id: "beam",
        header: "Beam No.",
        cell: ({ row }) => row.original.beam?.beamNo ?? "—",
      },
      {
        id: "quality",
        header: "Quality",
        cell: ({ row }) => row.original.productionQuality?.name ?? "—",
      },
      {
        id: "weight",
        header: "Weight",
        cell: ({ row }) => formatDecimal(row.original.weight),
      },
      {
        id: "remark",
        header: "Remark",
        cell: ({ row }) => row.original.remark ?? "—",
      },
      {
        id: "millStatus",
        header: "Mill Status",
        cell: ({ row }) => {
          const record = row.original;
          if (!record.millOutvertDate) {
            return <Badge variant="secondary">Not Sent</Badge>;
          }
          if (record.millOutvertDate && !record.millInvertId) {
            return (
              <Badge className="bg-amber-100 text-amber-800">At Mill</Badge>
            );
          }
          return (
            <Badge className="bg-green-100 text-green-800">Returned</Badge>
          );
        },
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
                aria-label="View production record"
                onClick={() => router.push(ROUTES.PRODUCTION.DETAIL(record.id))}
              >
                <Eye className="size-4" />
              </Button>
              <PermissionGate module="production" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit production record"
                  onClick={() => router.push(ROUTES.PRODUCTION.EDIT(record.id))}
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="production" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete production record"
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
    <PermissionGate module="production" action="view">
      <PageHeader
        title="Production"
        filter={<FirmFilter options={firmOptions} isLoading={firmsLoading} />}
      >
        <PermissionGate module="production" action="create">
          <Button size="sm" onClick={() => router.push(ROUTES.PRODUCTION.NEW)}>
            <Plus className="mr-1.5 size-4" />
            Add Production
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          tableId="production"
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
              <SearchBar placeholder="Search production..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Quality
                    </span>
                    <Select
                      value={searchParams.get("qualityId") ?? "all"}
                      onValueChange={handleQualityChange}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Qualities</SelectItem>
                        {qualityOptions.map((opt) => (
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
        title="Delete Production Record"
        description={
          deleteRecord
            ? `Are you sure you want to delete the production record for taka "${deleteRecord.takaSrNo}"? This action cannot be undone.`
            : "Are you sure you want to delete this production record? This action cannot be undone."
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PermissionGate>
  );
}
