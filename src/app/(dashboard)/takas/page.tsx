"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data/DataTable";
import { SearchBar } from "@/components/data/SearchBar";
import { FilterPanel } from "@/components/data/FilterPanel";
import { FirmFilter } from "@/components/data/FirmFilter";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { getTakas } from "@/lib/api/takas";
import { getFirms } from "@/lib/api/firms";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
import type { Taka } from "@/lib/api/takas";

const LIMIT = 20;

export default function TakasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? undefined;
  const beam_no = searchParams.get("beam_no") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;
  const meterMinRaw = searchParams.get("meter_min");
  const meterMaxRaw = searchParams.get("meter_max");
  const meter_min = meterMinRaw ? Number(meterMinRaw) : undefined;
  const meter_max = meterMaxRaw ? Number(meterMaxRaw) : undefined;

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteList<Taka, {
      search?: string;
      beam_no?: string;
      meter_min?: number;
      meter_max?: number;
      firmId?: string;
    }>({
      queryKey: ["takas"],
      params: { search, beam_no, meter_min, meter_max, firmId },
      limit: LIMIT,
      fetcher: getTakas,
    });

  const { data: firmsData } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const firmOptions = (firmsData?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  function handleBeamNoChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("beam_no", value);
    } else {
      params.delete("beam_no");
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

  const columns = useMemo<ColumnDef<Taka>[]>(
    () => [
      {
        accessorKey: "takaSrNo",
        header: "Taka Sr No",
      },
      {
        accessorKey: "takaNo",
        header: "Taka No",
      },
      {
        id: "beam",
        header: "Beam No",
        cell: ({ row }) => row.original.beam?.beamNo ?? "—",
      },
      {
        id: "takaMeter",
        header: "Meter",
        cell: ({ row }) => formatDecimal(row.original.takaMeter),
      },
      {
        id: "firm",
        header: "Firm",
        cell: ({ row }) => row.original.firm?.firmName ?? "—",
      },
      {
        id: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label="View taka"
            onClick={() => router.push(ROUTES.TAKAS.DETAIL(row.original.id))}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [router],
  );

  return (
    <PermissionGate module="takas" action="view">
      <PageHeader title="Takas" filter={<FirmFilter options={firmOptions} />} />

      <div className="space-y-4">
        <DataTable
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
              <SearchBar placeholder="Search takas..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Beam No
                    </span>
                    <Input
                      className="w-36"
                      placeholder="e.g. B001"
                      defaultValue={searchParams.get("beam_no") ?? ""}
                      onBlur={(e) => handleBeamNoChange(e.target.value)}
                    />
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
    </PermissionGate>
  );
}
