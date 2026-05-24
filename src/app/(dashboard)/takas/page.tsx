"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import { useFirms } from "@/lib/hooks/useFirms";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data/DataTable";
import { SearchBar } from "@/components/data/SearchBar";
import { FilterPanel } from "@/components/data/FilterPanel";
import { FirmFilter } from "@/components/data/FirmFilter";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MillStatusBadge } from "@/components/common/MillStatusBadge";
import { getTakas } from "@/lib/api/takas";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { formatDate } from "@/lib/utils/formatDate";
import { ROUTES } from "@/lib/routes";
import type { Taka } from "@/lib/api/takas";

type StatusTab = "all" | "at_mill" | "returned" | "not_sent";

const LIMIT = 20;

export default function TakasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "all") as StatusTab;
  const search = searchParams.get("search") ?? undefined;
  const beam_no = searchParams.get("beam_no") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;
  const meterMinRaw = searchParams.get("meter_min");
  const meterMaxRaw = searchParams.get("meter_max");
  const meter_min = meterMinRaw ? Number(meterMinRaw) : undefined;
  const meter_max = meterMaxRaw ? Number(meterMaxRaw) : undefined;

  const apiStatus = status === "all" ? undefined : status;

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<Taka, {
      search?: string;
      beam_no?: string;
      meter_min?: number;
      meter_max?: number;
      firmId?: string;
      status?: "at_mill" | "returned" | "not_sent";
    }>({
      queryKey: ["takas", status],
      params: { search, beam_no, meter_min, meter_max, firmId, status: apiStatus },
      limit: LIMIT,
      fetcher: getTakas,
    });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.push(`?${params.toString()}`);
  }

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
        id: "millStatus",
        header: "Mill Status",
        cell: ({ row }) => (
          <MillStatusBadge
            millOutvertDate={row.original.productionInfo?.millOutvertDate}
            millInvertId={row.original.productionInfo?.millInvertId}
          />
        ),
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
      <PageHeader
        title="Takas"
        filter={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FirmFilter options={firmOptions} isLoading={firmsLoading} />
            <Tabs value={status} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="at_mill">At Mill</TabsTrigger>
                <TabsTrigger value="returned">Returned</TabsTrigger>
                <TabsTrigger value="not_sent">Not Sent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
      />

      <div className="space-y-4">
        <DataTable
          tableId="takas"
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBeamNoChange(e.currentTarget.value);
                          e.currentTarget.blur();
                        }
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleMeterMinChange(e.currentTarget.value);
                          e.currentTarget.blur();
                        }
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleMeterMaxChange(e.currentTarget.value);
                          e.currentTarget.blur();
                        }
                      }}
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
