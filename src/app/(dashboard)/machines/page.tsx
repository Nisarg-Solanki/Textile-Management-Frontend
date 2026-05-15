"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getMachines } from "@/lib/api/machines";
import { useFirms } from "@/lib/hooks/useFirms";
import { FirmFilter } from "@/components/data/FirmFilter";
import { deleteMachineAction } from "@/lib/actions/machines.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { Machine } from "@/lib/api/machines";

const LIMIT = 10;

function parseStatus(raw: string | null): "active" | "inactive" | undefined {
  if (raw === "active" || raw === "inactive") return raw;
  return undefined;
}

export default function MachinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const status = parseStatus(searchParams.get("status"));
  const firmId = searchParams.get("firmId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["machines", { search, status, firmId, page, limit: LIMIT }],
    queryFn: () => getMachines({ search, status, firmId, page, limit: LIMIT }),
  });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMachineAction(deleteTarget.id);
      toast.success(`Machine "${deleteTarget.machineNo}" deleted successfully`);
      await queryClient.invalidateQueries({ queryKey: ["machines"] });
      setDeleteTarget(null);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<Machine>[]>(
    () => [
      {
        accessorKey: "machineNo",
        header: "Machine No",
      },
      {
        accessorKey: "machineType",
        header: "Machine Type",
        cell: ({ row }) => row.original.machineType ?? "—",
      },
      {
        id: "firm",
        header: "Firm",
        cell: ({ row }) => row.original.firm?.firmName ?? "—",
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
        accessorKey: "remark",
        header: "Remark",
        cell: ({ row }) => row.original.remark ?? "—",
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const machine = row.original;
          return (
            <div className="flex items-center gap-1">
              <PermissionGate module="machines" action="view">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="View machine"
                  onClick={() =>
                    router.push(ROUTES.MACHINES.DETAIL(machine.id))
                  }
                >
                  <Eye className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="machines" action="edit">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit machine"
                  onClick={() => router.push(ROUTES.MACHINES.EDIT(machine.id))}
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGate>
              <PermissionGate module="machines" action="delete">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete machine"
                  onClick={() => setDeleteTarget(machine)}
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
    <PermissionGate module="machines" action="view">
      <PageHeader
        title="Machines"
        filter={<FirmFilter options={firmOptions} isLoading={firmsLoading} />}
      >
        <PermissionGate module="machines" action="create">
          <Button size="sm" onClick={() => router.push(ROUTES.MACHINES.NEW)}>
            <Plus className="mr-1.5 size-4" />
            Add Machine
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
            <>
              <SearchBar placeholder="Search machines..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex flex-wrap items-center gap-4">
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
        title="Delete Machine"
        description={`Are you sure you want to delete machine "${deleteTarget?.machineNo}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PermissionGate>
  );
}
