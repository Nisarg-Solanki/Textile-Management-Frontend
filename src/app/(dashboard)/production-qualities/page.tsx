"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ProductionQualityDialog } from "@/components/modules/production-qualities/ProductionQualityDialog";
import { getProductionQualities } from "@/lib/api/productionQualities";
import type { ProductionQuality } from "@/lib/api/productionQualities";
import { deleteProductionQualityAction } from "@/lib/actions/productionQualities.actions";
import { ApiError, showErrorToast } from "@/lib/utils/handleError";
import { formatDate } from "@/lib/utils/formatDate";

type EditQuality = { id: string; name: string; status: string };

export default function ProductionQualitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [createOpen, setCreateOpen] = useState(false);
  const [editQuality, setEditQuality] = useState<EditQuality | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["production-qualities", search, page],
    queryFn: () => getProductionQualities({ search, page, limit: 20 }),
  });

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  const columns = useMemo<ColumnDef<ProductionQuality>[]>(
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
              <PermissionGate module="production_qualities" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit production quality"
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
              <PermissionGate module="production_qualities" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete production quality"
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
    <PermissionGate module="production_qualities" action="view" fallback={<p className="text-muted-foreground">You do not have permission to view production qualities.</p>}>
      <PageHeader title="Production Qualities">
        <PermissionGate module="production_qualities" action="create">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Add Production Quality
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={handlePageChange}
          toolbar={
            <SearchBar placeholder="Search production qualities..." className="flex-1 min-w-[180px]" />
          }
        />
      </div>

      <ProductionQualityDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["production-qualities"] })
        }
      />

      <ProductionQualityDialog
        open={!!editQuality}
        onOpenChange={(v) => {
          if (!v) setEditQuality(null);
        }}
        quality={editQuality ?? undefined}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["production-qualities"] })
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => {
          if (!v) setDeleteId(null);
        }}
        title="Delete Production Quality"
        description="This cannot be undone."
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!deleteId) return;
          setIsDeleting(true);
          try {
            await deleteProductionQualityAction(deleteId);
            toast.success("Production quality deleted");
            await queryClient.invalidateQueries({
              queryKey: ["production-qualities"],
            });
            setDeleteId(null);
          } catch (err) {
            if (
              err instanceof ApiError &&
              err.code === "PRODUCTION_QUALITY_IN_USE"
            ) {
              toast.error(
                "Cannot delete — production records are using this quality",
              );
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
