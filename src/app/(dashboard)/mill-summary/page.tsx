"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/data/SearchBar";
import { FilterPanel } from "@/components/data/FilterPanel";
import { DateRangeFilter } from "@/components/data/DateRangeFilter";
import { FirmFilter } from "@/components/data/FirmFilter";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MillSummaryTable } from "@/components/modules/mill-summary/MillSummaryTable";
import { getMillSummary } from "@/lib/api/millSummary";
import { useFirms } from "@/lib/hooks/useFirms";

const LIMIT = 20;

type StatusTab = "all" | "at_mill" | "returned" | "not_sent";

export default function MillSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "all") as StatusTab;
  const search = searchParams.get("search") ?? undefined;
  const date_from = searchParams.get("date_from") ?? undefined;
  const date_to = searchParams.get("date_to") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;

  // Local state for mill free-text filter — debounced to URL
  const [millInput, setMillInput] = useState(searchParams.get("mill") ?? "");
  const millDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mill = searchParams.get("mill") ?? undefined;

  useEffect(() => {
    if (millDebounceRef.current) clearTimeout(millDebounceRef.current);
    millDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (millInput) {
        params.set("mill", millInput);
      } else {
        params.delete("mill");
      }
      router.push(`?${params.toString()}`);
    }, 300);
    return () => {
      if (millDebounceRef.current) clearTimeout(millDebounceRef.current);
    };
  }, [millInput, router, searchParams]);

  const apiStatus = status === "all" ? undefined : status;

  const { items, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteList<import("@/lib/api/millSummary").MillSummaryRow, {
      search?: string;
      mill?: string;
      status?: string;
      date_from?: string;
      date_to?: string;
      firmId?: string;
    }>({
      queryKey: ["mill-summary", status],
      params: { search, mill, status: apiStatus, date_from, date_to, firmId },
      limit: LIMIT,
      fetcher: getMillSummary,
    });

  const { firmOptions, isLoading: firmsLoading } = useFirms();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <PermissionGate module="mill_summary" action="view">
      <PageHeader
        title="Mill Summary"
        filter={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FirmFilter options={firmOptions} isLoading={firmsLoading} />
            <Tabs value={status} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="at_mill">At Mill</TabsTrigger>
                <TabsTrigger value="returned">Returned</TabsTrigger>
                {/* <TabsTrigger value="not_sent">Not Sent</TabsTrigger> */}
              </TabsList>
            </Tabs>
          </div>
        }
      />

      <div className="space-y-4">
        <MillSummaryTable
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
              <SearchBar placeholder="Search mill summary..." className="flex-1 min-w-[180px]" />
              <FilterPanel>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Mill
                    </span>
                    <Input
                      value={millInput}
                      onChange={(e) => setMillInput(e.target.value)}
                      placeholder="Filter by mill name"
                      className="w-48"
                    />
                  </div>
                  <DateRangeFilter />
                </div>
              </FilterPanel>
            </>
          }
        />
      </div>
    </PermissionGate>
  );
}
