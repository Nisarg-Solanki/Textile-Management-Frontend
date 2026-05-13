import { getList, type PaginatedResponse } from "@/lib/api/request";

export type MachineInfoRow = {
  machineId: string;
  machineNo: string;
  machineType?: string;
  firmId: string;
  firmName: string;
  latestTakaSrNo?: string;
  latestEntryDate?: string;
  status: string;
};

export function getMachineInfo(params?: {
  search?: string;
  machine_no?: string;
  firmId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<MachineInfoRow>> {
  return getList<MachineInfoRow>("/machine-info", params);
}
