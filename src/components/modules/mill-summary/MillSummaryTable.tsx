"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/DataTable";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
import type { MillSummaryRow } from "@/lib/api/millSummary";

type Props = {
  data: MillSummaryRow[];
  isLoading?: boolean;
  toolbar?: ReactNode;
  infiniteScroll?: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    totalCount?: number;
  };
};

type MillStatus = "not_sent" | "at_mill" | "returned";

function deriveStatus(row: MillSummaryRow): MillStatus {
  if (!row.millOutvertId) return "not_sent";
  if (!row.millInvertId) return "at_mill";
  return "returned";
}

const STATUS_ROW_CLASS: Record<MillStatus, string> = {
  not_sent: "",
  at_mill: "bg-amber-50 dark:bg-amber-950/20",
  returned: "bg-green-50 dark:bg-green-950/20",
};

function getRowClassName(row: Row<MillSummaryRow>): string {
  return STATUS_ROW_CLASS[deriveStatus(row.original)];
}

function StatusBadge({ row }: { row: MillSummaryRow }) {
  const status = deriveStatus(row);
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

export function MillSummaryTable({
  data,
  isLoading,
  toolbar,
  infiniteScroll,
}: Props) {
  const columns = useMemo<ColumnDef<MillSummaryRow>[]>(
    () => [
      {
        accessorKey: "takaSrNo",
        header: "Taka Sr No",
        cell: ({ row }) => (
          <Link
            href={ROUTES.TAKAS.DETAIL(row.original.taka.id)}
            className="text-primary hover:underline font-medium"
          >
            {row.original.takaSrNo}
          </Link>
        ),
      },
      {
        id: "outvertDate",
        header: "Outvert Date",
        cell: ({ row }) =>
          row.original.millOutvert?.outvertDate
            ? formatDate(row.original.millOutvert.outvertDate)
            : "—",
      },
      {
        id: "millName",
        header: "Mill Name",
        cell: ({ row }) => row.original.millName ?? "—",
      },
      {
        id: "firmChallanNo",
        header: "Firm Challan No",
        cell: ({ row }) => row.original.millOutvert?.firmChallanNo ?? "—",
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
          row.original.millInvert?.invertDate
            ? formatDate(row.original.millInvert.invertDate)
            : "—",
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <StatusBadge row={row.original} />,
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
      infiniteScroll={infiniteScroll}
      getRowClassName={getRowClassName}
    />
  );
}
