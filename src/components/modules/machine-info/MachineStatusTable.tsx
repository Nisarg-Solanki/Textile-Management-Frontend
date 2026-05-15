"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { DataTable } from "@/components/data/DataTable";
import { formatDate } from "@/lib/utils/formatDate";
import { formatDecimal } from "@/lib/utils/formatDecimal";
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
  toolbar?: ReactNode;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
};

export function MachineStatusTable({
  data,
  isLoading,
  toolbar,
  pagination,
  onPageChange,
}: Props) {
  const columns = useMemo<ColumnDef<MachineInfoRow>[]>(
    () => [
      {
        id: "machineNo",
        header: "Machine No",
        cell: ({ row }) => row.original.machine.machineNo,
      },
      {
        id: "firm",
        header: "Firm",
        cell: ({ row }) => row.original.machine.firm.firmName,
      },
      {
        id: "beamNo",
        header: "Beam No",
        cell: ({ row }) => row.original.beam.beamNo,
      },
      {
        accessorKey: "takaSrNo",
        header: "Taka Sr No",
      },
      {
        id: "takaMeter",
        header: "Taka Meter",
        cell: ({ row }) => formatDecimal(row.original.takaMeter),
      },
      {
        id: "entryDate",
        header: "Entry Date",
        cell: ({ row }) => formatDate(row.original.entryDate),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      toolbar={toolbar}
      pagination={pagination}
      onPageChange={onPageChange}
    />
  );
}
