"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { getFirms } from "@/lib/api/firms";

const LIMIT = 20;

export default function MachineInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? undefined;
  const machine_no = searchParams.get("machine_no") ?? undefined;
  const firmId = searchParams.get("firmId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const { data, isLoading } = useQuery({
    queryKey: ["machine-info", search, machine_no, firmId, page],
    queryFn: () =>
      getMachineInfo({ search, machine_no, firmId, page, limit: LIMIT }),
    refetchInterval: 30000,
  });

  const { data: firmsData } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const firmOptions = (firmsData?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  function handleMachineNoChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("machine_no", value);
    } else {
      params.delete("machine_no");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <PermissionGate module="machine_info" action="view">
      <PageHeader title="Machine Info">
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["machine-info"] })
          }
        >
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      <div className="space-y-4">
        <FirmFilter options={firmOptions} />
        <div className="flex flex-col sm:flex-row gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <SearchBar placeholder="Search machines..." className="flex-1 max-w-none" />
        </div>
        <FilterPanel>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Machine No
              </span>
              <Input
                value={machine_no ?? ""}
                onChange={(e) => handleMachineNoChange(e.target.value)}
                placeholder="Filter by machine no"
                className="w-48"
              />
            </div>
          </div>
        </FilterPanel>

        <MachineStatusTable
          data={data?.data ?? []}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </PermissionGate>
  );
}
