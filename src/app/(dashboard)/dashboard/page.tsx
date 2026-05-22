"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  Factory,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { FirmFilter } from "@/components/data/FirmFilter";
import { useFirms } from "@/lib/hooks/useFirms";
import { getDashboardStats, getProductionChart } from "@/lib/api/dashboard";
import { formatDecimal } from "@/lib/utils/formatDecimal";
import { cn } from "@/lib/utils/cn";
import type { ProductionChartType } from "@/types/app";

const PERIOD_OPTIONS: { value: ProductionChartType; label: string }[] = [
  { value: "daily", label: "This Week" },
  { value: "weekly", label: "Last 4 Weeks" },
  { value: "monthly", label: "Last 12 Months" },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const firmId = searchParams.get("firmId") ?? undefined;

  const [chartType, setChartType] = useState<ProductionChartType>("daily");

  const { firmOptions, isLoading: isFirmsLoading } = useFirms();

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats", firmId ?? "all"],
    queryFn: () => getDashboardStats(firmId),
  });

  const { data: chart, isLoading: isChartLoading } = useQuery({
    queryKey: ["dashboard-chart", chartType, firmId ?? "all"],
    queryFn: () => getProductionChart(chartType, firmId),
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        filter={<FirmFilter options={firmOptions} isLoading={isFirmsLoading} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Beams"
          icon={<Layers className="size-5 text-muted-foreground" />}
          isLoading={isStatsLoading}
          value={stats?.totalBeams.value}
          changePercent={stats?.totalBeams.changePercent}
          trend={stats?.totalBeams.trend}
          label={stats?.totalBeams.label}
        />
        <StatCard
          title="Production Entries"
          icon={<Factory className="size-5 text-muted-foreground" />}
          isLoading={isStatsLoading}
          value={stats?.productionEntries.value}
          changePercent={stats?.productionEntries.changePercent}
          trend={stats?.productionEntries.trend}
          label={stats?.productionEntries.label}
        />
        <StatCard
          title="Pending Takas"
          icon={<AlertCircle className="size-5 text-destructive" />}
          isLoading={isStatsLoading}
          value={stats?.pendingTakas.value}
          attentionLabel={stats?.pendingTakas.label}
          requiresAttention={stats?.pendingTakas.requiresAttention}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Production (Meters)</CardTitle>
          <Select
            value={chartType}
            onValueChange={(v) => setChartType(v as ProductionChartType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isChartLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={chart?.points ?? []}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="productionFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                  formatter={(value: number) => [
                    formatDecimal(value),
                    "Meters",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#productionFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type StatCardProps = {
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  value?: number;
  changePercent?: number;
  trend?: "up" | "down";
  label?: string;
  attentionLabel?: string;
  requiresAttention?: boolean;
};

function StatCard({
  title,
  icon,
  isLoading,
  value,
  changePercent,
  trend,
  label,
  attentionLabel,
  requiresAttention,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex size-9 items-center justify-center rounded-md bg-muted">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight">
              {value?.toLocaleString() ?? "—"}
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {requiresAttention ? (
                <span className="flex items-center gap-1 text-destructive">
                  <TrendingUp className="size-4" />
                  {attentionLabel ?? "Requires attention"}
                </span>
              ) : (
                <>
                  {trend === "down" ? (
                    <TrendingDown className="size-4 text-destructive" />
                  ) : (
                    <TrendingUp className="size-4 text-emerald-600" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend === "down"
                        ? "text-destructive"
                        : "text-emerald-600",
                    )}
                  >
                    {changePercent != null
                      ? `${changePercent > 0 ? "+" : ""}${changePercent}%`
                      : "—"}
                  </span>
                  {label && (
                    <span className="text-muted-foreground">{label}</span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
