"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { DatePickerField } from "@/components/forms/DatePickerField";
import { getMillOutverts } from "@/lib/api/millOutverts";
import { getFirms } from "@/lib/api/firms";
import { getMills } from "@/lib/api/mills";
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
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mill-outverts", search, millId, firmId, date_from, date_to, page],
    queryFn: () =>
      getMillOutverts({ search, millId, firmId, date_from, date_to, page, limit: LIMIT }),
  });

  const { data: firmsData } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const { data: millsData } = useQuery({
    queryKey: ["mills-active"],
    queryFn: () => getMills({ status: "active", limit: 100 }),
  });

  const firmOptions = (firmsData?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  const millOptions = (millsData?.data ?? []).map((m) => ({
    value: m.id,
    label: m.millName,
  }));

  const deleteRecord = data?.data.find((r) => r.id === deleteId);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  function handleMillChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("millId");
    } else {
      params.set("millId", value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function handleFirmChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("firmId");
    } else {
      params.set("firmId", value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function handleDateFromChange(date: Date | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (date) {
      params.set("date_from", date.toISOString());
    } else {
      params.delete("date_from");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function handleDateToChange(date: Date | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (date) {
      params.set("date_to", date.toISOString());
    } else {
      params.delete("date_to");
    }
    params.set("page", "1");
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
      <PageHeader title="Mill Outverts">
        <PermissionGate module="mill_outverts" action="create">
          <Button onClick={() => router.push(ROUTES.MILL_OUTVERTS.NEW)}>
            <Plus className="mr-2 size-4" />
            Add Mill Outvert
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar placeholder="Search mill outverts..." />
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Firm
                </span>
                <Select
                  value={searchParams.get("firmId") ?? "all"}
                  onValueChange={handleFirmChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Firms</SelectItem>
                    {firmOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  From
                </Label>
                <DatePickerField
                  value={date_from ? new Date(date_from) : undefined}
                  onChange={handleDateFromChange}
                  placeholder="From date"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  To
                </Label>
                <DatePickerField
                  value={date_to ? new Date(date_to) : undefined}
                  onChange={handleDateToChange}
                  placeholder="To date"
                />
              </div>
            </div>
          </FilterPanel>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={handlePageChange}
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
