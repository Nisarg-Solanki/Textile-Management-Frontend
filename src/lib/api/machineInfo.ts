import { getList, type PaginatedResponse } from "@/lib/api/request";

export type MachineInfoRow = {
  id: string;
  machine: {
    id: string;
    machineNo: string;
    firm: {
      id: string;
      firmName: string;
      firmCode: string;
    };
  };
  beam: {
    id: string;
    beamNo: string;
  };
  takaSrNo: string;
  takaMeter: string;
  entryDate: string;
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
