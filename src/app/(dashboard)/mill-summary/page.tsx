"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/data/SearchBar";
import { FilterPanel } from "@/components/data/FilterPanel";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { MillSummaryTable } from "@/components/modules/mill-summary/MillSummaryTable";
import { getMillSummary } from "@/lib/api/millSummary";
import { getFirms } from "@/lib/api/firms";

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
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

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
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }, 300);
    return () => {
      if (millDebounceRef.current) clearTimeout(millDebounceRef.current);
    };
  }, [millInput, router, searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["mill-summary", status, search, mill, date_from, date_to, firmId, page],
    queryFn: () =>
      getMillSummary({
        search,
        mill,
        status: status === "all" ? undefined : status,
        date_from,
        date_to,
        firmId,
        page,
        limit: LIMIT,
      }),
  });

  const { data: firmsData } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const firmOptions = (firmsData?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
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

  return (
    <PermissionGate module="mill_summary" action="view">
      <PageHeader title="Mill Summary" />

      <div className="space-y-4">
        <Tabs value={status} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="at_mill">At Mill</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
            <TabsTrigger value="not_sent">Not Sent</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3">
          <SearchBar placeholder="Search mill summary..." />
          <FilterPanel>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Mill
                </Label>
                <Input
                  value={millInput}
                  onChange={(e) => setMillInput(e.target.value)}
                  placeholder="Filter by mill name"
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Firm
                </Label>
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

        <MillSummaryTable
          data={data?.data ?? []}
          isLoading={isLoading}
        />
      </div>
    </PermissionGate>
  );
}
