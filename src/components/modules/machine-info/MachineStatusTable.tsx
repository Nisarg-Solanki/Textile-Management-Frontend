"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/DataTable";
import { formatDate } from "@/lib/utils/formatDate";
import type { MachineInfoRow } from "@/lib/api/machineInfo";

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Props = {
  data: MachineInfoRow[];
  isLoading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
};

export function MachineStatusTable({
  data,
  isLoading,
  pagination,
  onPageChange,
}: Props) {
  const columns = useMemo<ColumnDef<MachineInfoRow>[]>(
    () => [
      {
        accessorKey: "machineNo",
        header: "Machine No",
      },
      {
        id: "machineType",
        header: "Machine Type",
        cell: ({ row }) => row.original.machineType ?? "—",
      },
      {
        accessorKey: "firmName",
        header: "Firm",
      },
      {
        id: "latestTakaSrNo",
        header: "Latest Taka Sr No",
        cell: ({ row }) => row.original.latestTakaSrNo ?? "—",
      },
      {
        id: "latestEntryDate",
        header: "Latest Entry Date",
        cell: ({ row }) =>
          row.original.latestEntryDate
            ? formatDate(row.original.latestEntryDate)
            : "—",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const active = row.original.status === "active";
          return (
            <Badge variant={active ? "default" : "secondary"}>
              {active ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
    />
  );
}
