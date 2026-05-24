"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/data/SearchBar";
import { FilterPanel } from "@/components/data/FilterPanel";
import { FirmFilter } from "@/components/data/FirmFilter";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MachineStatusTable } from "@/components/modules/machine-info/MachineStatusTable";
import { getMachineInfo } from "@/lib/api/machineInfo";
import { useFirms } from "@/lib/hooks/useFirms";

const LIMIT = 20;

export default function MachineInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const machine_no = searchParams.get("machine_no") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;

  // Local state so the input feels instant; URL (and thus the query) only
  // updates after the user stops typing for 300 ms — same pattern as SearchBar.
  const [machineNoInput, setMachineNoInput] = useState(machine_no ?? "");
  const machineNoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<import("@/lib/api/machineInfo").MachineInfoRow, {
      search?: string;
      machine_no?: string;
      firmId?: string;
    }>({
      queryKey: ["machine-info"],
      params: { search, machine_no, firmId },
      limit: LIMIT,
      fetcher: getMachineInfo,
    });

  // Live polling — refetch from first page every 30s
  useEffect(() => {
    const id = setInterval(() => refetch(), 30000);
    return () => clearInterval(id);
  }, [refetch]);

  // Debounce machine_no → URL writes (300 ms)
  useEffect(() => {
    if (machineNoDebounceRef.current) clearTimeout(machineNoDebounceRef.current);

    machineNoDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (machineNoInput) {
        params.set("machine_no", machineNoInput);
      } else {
        params.delete("machine_no");
      }
      router.push(`?${params.toString()}`);
    }, 300);

    return () => {
      if (machineNoDebounceRef.current) clearTimeout(machineNoDebounceRef.current);
    };
  }, [machineNoInput, router, searchParams]);

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  return (
    <PermissionGate module="machine_info" action="view">
      <PageHeader
        title="Machine Info"
        filter={<FirmFilter options={firmOptions} isLoading={firmsLoading} />}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["machine-info"] })
          }
        >
          <RefreshCw className="size-4 mr-1.5" />
          Refresh
        </Button>
      </PageHeader>

      <div className="space-y-4">
        <MachineStatusTable
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
              <SearchBar placeholder="Search machines..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Machine No
                    </span>
                    <Input
                      value={machineNoInput}
                      onChange={(e) => setMachineNoInput(e.target.value)}
                      placeholder="Filter by machine no"
                      className="w-48"
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
