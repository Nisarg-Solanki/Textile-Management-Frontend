"use client";

import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/DataTable";
import { formatDate } from "@/lib/utils/formatDate";
import type { MillSummaryRow } from "@/lib/api/millSummary";

type Props = {
  data: MillSummaryRow[];
  isLoading?: boolean;
};

const STATUS_ROW_CLASS: Record<MillSummaryRow["status"], string> = {
  not_sent: "",
  at_mill: "bg-amber-50 dark:bg-amber-950/20",
  returned: "bg-green-50 dark:bg-green-950/20",
};

function getRowClassName(row: Row<MillSummaryRow>): string {
  return STATUS_ROW_CLASS[row.original.status];
}

function StatusBadge({ status }: { status: MillSummaryRow["status"] }) {
  if (status === "at_mill") {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        At Mill
      </Badge>
    );
  }
  if (status === "returned") {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Returned
      </Badge>
    );
  }
  return <Badge variant="secondary">Not Sent</Badge>;
}

export function MillSummaryTable({ data, isLoading }: Props) {
  const columns = useMemo<ColumnDef<MillSummaryRow>[]>(
    () => [
      {
        accessorKey: "takaSrNo",
        header: "Taka Sr No",
      },
      {
        accessorKey: "beamNo",
        header: "Beam No",
      },
      {
        id: "outvertDate",
        header: "Outvert Date",
        cell: ({ row }) =>
          row.original.outvertDate ? formatDate(row.original.outvertDate) : "—",
      },
      {
        id: "millName",
        header: "Mill Name",
        cell: ({ row }) => row.original.millName ?? "—",
      },
      {
        id: "millChallanNo",
        header: "Mill Challan No",
        cell: ({ row }) => row.original.millChallanNo ?? "—",
      },
      {
        id: "invertDate",
        header: "Invert Date",
        cell: ({ row }) =>
          row.original.invertDate ? formatDate(row.original.invertDate) : "—",
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      getRowClassName={getRowClassName}
    />
  );
}
