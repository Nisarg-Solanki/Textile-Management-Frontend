"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { getMills } from "@/lib/api/mills";
import { deleteMillAction } from "@/lib/actions/mills.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { Mill } from "@/types/app";

const LIMIT = 10;

function parseStatus(
  raw: string | null,
): "active" | "inactive" | undefined {
  if (raw === "active" || raw === "inactive") return raw;
  return undefined;
}

export default function MillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const status = parseStatus(searchParams.get("status"));

  const [deleteTarget, setDeleteTarget] = useState<Mill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<Mill, { search?: string; status?: "active" | "inactive" }>({
      queryKey: ["mills"],
      params: { search, status },
      limit: LIMIT,
      fetcher: getMills,
    });

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMillAction(deleteTarget.id);
      toast.success(`"${deleteTarget.millName}" deleted successfully`);
      await queryClient.invalidateQueries({ queryKey: ["mills"] });
      setDeleteTarget(null);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<Mill>[]>(
    () => [
      {
        accessorKey: "millName",
        header: "Mill Name",
      },
      {
        accessorKey: "millCode",
        header: "Mill Code",
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "active" ? "default" : "secondary"
            }
          >
            {row.original.status === "active" ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const mill = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View mill"
                onClick={() => router.push(ROUTES.MILLS.DETAIL(mill.id))}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit mill"
                onClick={() => router.push(ROUTES.MILLS.EDIT(mill.id))}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete mill"
                onClick={() => setDeleteTarget(mill)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router],
  );

  return (
    <SuperAdminGate>
      <PageHeader title="Mills">
        <Button size="sm" onClick={() => router.push(ROUTES.MILLS.NEW)}>
          <Plus className="mr-1.5 size-4" />
          Add Mill
        </Button>
      </PageHeader>

      <div className="space-y-4">
        <DataTable
          tableId="mills"
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
              <SearchBar placeholder="Search mills..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status
                  </span>
                  <Select
                    value={searchParams.get("status") ?? "all"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FilterPanel>
            </>
          }
        />
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Mill"
        description={`Are you sure you want to delete "${deleteTarget?.millName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </SuperAdminGate>
  );
}
