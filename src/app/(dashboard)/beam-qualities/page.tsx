"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data/DataTable";
import { SearchBar } from "@/components/data/SearchBar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { BeamQualityDialog } from "@/components/modules/beam-qualities/BeamQualityDialog";
import { getBeamQualities } from "@/lib/api/beamQualities";
import type { BeamQuality } from "@/lib/api/beamQualities";
import { deleteBeamQualityAction } from "@/lib/actions/beamQualities.actions";
import { ApiError, showErrorToast } from "@/lib/utils/handleError";
import { formatDate } from "@/lib/utils/formatDate";

type EditQuality = { id: string; name: string; status: string };

export default function BeamQualitiesPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;

  const [createOpen, setCreateOpen] = useState(false);
  const [editQuality, setEditQuality] = useState<EditQuality | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<BeamQuality, { search?: string }>({
      queryKey: ["beam-qualities"],
      params: { search },
      limit: 20,
      fetcher: getBeamQualities,
    });

  const columns = useMemo<ColumnDef<BeamQuality>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "active" ? "default" : "secondary"}
          >
            {row.original.status === "active" ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const quality = row.original;
          return (
            <div className="flex items-center gap-1">
              <PermissionGate module="beam_qualities" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit beam quality"
                  onClick={() =>
                    setEditQuality({
                      id: quality.id,
                      name: quality.name,
                      status: quality.status,
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="beam_qualities" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete beam quality"
                  onClick={() => setDeleteId(quality.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </PermissionGate>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <PermissionGate module="beam_qualities" action="view" fallback={<p className="text-muted-foreground">You do not have permission to view beam qualities.</p>}>
      <PageHeader title="Beam Qualities">
        <PermissionGate module="beam_qualities" action="create">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Add Beam Quality
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          tableId="beam-qualities"
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
            <SearchBar placeholder="Search beam qualities..." className="flex-1 min-w-[180px]" />
          }
        />
      </div>

      <BeamQualityDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["beam-qualities"] })
        }
      />

      <BeamQualityDialog
        open={!!editQuality}
        onOpenChange={(v) => {
          if (!v) setEditQuality(null);
        }}
        quality={editQuality ?? undefined}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["beam-qualities"] })
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => {
          if (!v) setDeleteId(null);
        }}
        title="Delete Beam Quality"
        description="This cannot be undone."
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!deleteId) return;
          setIsDeleting(true);
          try {
            await deleteBeamQualityAction(deleteId);
            toast.success("Beam quality deleted");
            await queryClient.invalidateQueries({
              queryKey: ["beam-qualities"],
            });
            setDeleteId(null);
          } catch (err) {
            if (
              err instanceof ApiError &&
              err.code === "BEAM_QUALITY_IN_USE"
            ) {
              toast.error("Cannot delete — beams are using this quality");
            } else {
              showErrorToast(err);
            }
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </PermissionGate>
  );
}
