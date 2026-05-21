"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FirmFilter } from "@/components/data/FirmFilter";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getBeams } from "@/lib/api/beams";
import { useFirms } from "@/lib/hooks/useFirms";
import { deleteBeamAction } from "@/lib/actions/beams.actions";
import { ApiError, showErrorToast } from "@/lib/utils/handleError";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { ROUTES } from "@/lib/routes";
import type { Beam } from "@/lib/api/beams";

const LIMIT = 20;

export default function BeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const qualityId = searchParams.get("qualityId") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;
  const meterMinRaw = searchParams.get("meter_min");
  const meterMaxRaw = searchParams.get("meter_max");
  const meter_min = meterMinRaw ? Number(meterMinRaw) : undefined;
  const meter_max = meterMaxRaw ? Number(meterMaxRaw) : undefined;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<Beam, {
      search?: string;
      qualityId?: string;
      firmId?: string;
      meter_min?: number;
      meter_max?: number;
    }>({
      queryKey: ["beams"],
      params: { search, qualityId, firmId, meter_min, meter_max },
      limit: LIMIT,
      fetcher: getBeams,
    });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  const qualityOptions = Array.from(
    new Map(
      items
        .filter((b) => b.beamQuality)
        .map((b) => [b.beamQuality!.id, b.beamQuality!])
    ).values()
  ).map((q) => ({ value: q.id, label: q.name }));

  const deleteBeam = items.find((b) => b.id === deleteId);

  function handleQualityChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("qualityId");
    } else {
      params.set("qualityId", value);
    }
    router.push(`?${params.toString()}`);
  }

  function handleMeterMinChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("meter_min", value);
    } else {
      params.delete("meter_min");
    }
    router.push(`?${params.toString()}`);
  }

  function handleMeterMaxChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("meter_max", value);
    } else {
      params.delete("meter_max");
    }
    router.push(`?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteBeamAction(deleteId);
      toast.success("Beam deleted");
      await queryClient.invalidateQueries({ queryKey: ["beams"] });
      setDeleteId(null);
    } catch (err) {
      if (err instanceof ApiError && err.code === "BEAM_IN_USE") {
        toast.error("Cannot delete — production records are linked to this beam");
      } else {
        showErrorToast(err);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<Beam>[]>(
    () => [
      {
        accessorKey: "beamNo",
        header: "Beam No",
      },
      {
        id: "beamQuality",
        header: "Quality",
        cell: ({ row }) => row.original.beamQuality?.name ?? "—",
      },
      {
        id: "firm",
        header: "Firm",
        cell: ({ row }) => row.original.firm?.firmName ?? "—",
      },
      {
        accessorKey: "tar",
        header: "Tar",
      },
      {
        accessorKey: "takaQty",
        header: "Taka Qty",
      },
      {
        id: "beamMeter",
        header: "Beam Meter",
        cell: ({ row }) => formatDecimal(row.original.beamMeter),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const beam = row.original;
          return (
            <div className="flex items-center gap-1">
              <PermissionGate module="beams" action="view">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="View beam"
                  onClick={() => router.push(ROUTES.BEAMS.DETAIL(beam.id))}
                >
                  <Eye className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="beams" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit beam"
                  onClick={() => router.push(ROUTES.BEAMS.EDIT(beam.id))}
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="beams" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete beam"
                  onClick={() => setDeleteId(beam.id)}
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
    <PermissionGate module="beams" action="view">
      <PageHeader
        title="Beams"
        filter={<FirmFilter options={firmOptions} isLoading={firmsLoading} />}
      >
        <PermissionGate module="beams" action="create">
          <Button size="sm" onClick={() => router.push(ROUTES.BEAMS.NEW)}>
            <Plus className="mr-1.5 size-4" />
            Add Beam
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          tableId="beams"
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
              <SearchBar placeholder="Search beams..." className="flex-1 min-w-[180px]" />
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Min Meter
                    </span>
                    <Input
                      type="number"
                      className="w-28"
                      placeholder="0"
                      defaultValue={searchParams.get("meter_min") ?? ""}
                      onBlur={(e) => handleMeterMinChange(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Max Meter
                    </span>
                    <Input
                      type="number"
                      className="w-28"
                      placeholder="∞"
                      defaultValue={searchParams.get("meter_max") ?? ""}
                      onBlur={(e) => handleMeterMaxChange(e.target.value)}
                    />
                  </div>
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
        title="Delete Beam"
        description={
          deleteBeam
            ? `Are you sure you want to delete beam "${deleteBeam.beamNo}"? This action cannot be undone.`
            : "Are you sure you want to delete this beam? This action cannot be undone."
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PermissionGate>
  );
}
