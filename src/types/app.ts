import type { paths } from "@/types/api";

// ─── From generated OpenAPI spec ────────────────────────────────────────────

export type PermissionRow =
  paths["/api/v1/permissions/{adminId}"]["put"]["requestBody"]["content"]["application/json"][number];

// Same shape as PermissionRow — alias used in Zustand store
export type Permission = PermissionRow;

export type FirmListParams =
  paths["/api/v1/firms"]["get"]["parameters"]["query"];

export type CreateFirmBody =
  paths["/api/v1/firms"]["post"]["requestBody"]["content"]["application/json"];

export type MillListParams =
  paths["/api/v1/mills"]["get"]["parameters"]["query"];

export type CreateMillBody =
  paths["/api/v1/mills"]["post"]["requestBody"]["content"]["application/json"];

export type MachineListParams =
  paths["/api/v1/machines"]["get"]["parameters"]["query"];

export type CreateMachineBody =
  paths["/api/v1/machines"]["post"]["requestBody"]["content"]["application/json"];

// ─── Manual — response bodies are not in the OpenAPI spec ───────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  status: string;
  createdAt: Date;
};

export type PermissionsApiResponse = {
  user: { id: string; name: string; email: string };
  permissions: PermissionRow[];
};

export type Firm = {
  id: string;
  firmName: string;
  firmCode: string;
  challanEnable: boolean;
  srNoSeries: string | null;
  address: string | null;
  contactPerson: string | null;
  contactNumber: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalBeams: {
    value: number;
    changePercent: number;
    trend: "up" | "down";
    label: string;
  };
  productionEntries: {
    value: number;
    changePercent: number;
    trend: "up" | "down";
    label: string;
  };
  pendingTakas: {
    value: number;
    requiresAttention: boolean;
    label: string;
  };
};

export type ProductionChartType = "daily" | "weekly" | "monthly";

export type ProductionChartPoint = {
  label: string;
  periodStart: string;
  periodEnd: string;
  value: number;
};

export type ProductionChart = {
  type: ProductionChartType;
  points: ProductionChartPoint[];
};

export type Mill = {
  id: string;
  millName: string;
  millCode: string | null;
  address: string | null;
  contactPerson: string | null;
  contactNumber: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
