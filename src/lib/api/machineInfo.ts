import { getList, type PaginatedResponse } from "@/lib/api/request";

export type TakaInfo = {
  id: string;
  takaSrNo: string;
  takaMeter: string;
};

export type BeamInfo = {
  id: string;
  beamNo: string;
  beamMeter: string;
  takas: TakaInfo[];
};

export type MachineInfoRow = {
  id: string;
  firmId: string;
  machineNo: string;
  machineType: string;
  status: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  firm: {
    id: string;
    firmName: string;
    firmCode: string;
  };
  beams: BeamInfo[];
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
