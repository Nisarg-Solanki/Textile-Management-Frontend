import { getOne } from "@/lib/api/request";
import type {
  DashboardStats,
  ProductionChart,
  ProductionChartType,
} from "@/types/app";

export function getDashboardStats(firmId?: string): Promise<DashboardStats> {
  const query = firmId ? `?firmId=${encodeURIComponent(firmId)}` : "";
  return getOne<DashboardStats>(`/dashboard/stats${query}`);
}

export function getProductionChart(
  type: ProductionChartType = "weekly",
  firmId?: string,
): Promise<ProductionChart> {
  const params = new URLSearchParams({ type });
  if (firmId) params.set("firmId", firmId);
  return getOne<ProductionChart>(`/dashboard/production-chart?${params.toString()}`);
}
