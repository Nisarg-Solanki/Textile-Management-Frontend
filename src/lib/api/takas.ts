import { getList, getOne } from "@/lib/api/request";

export type Taka = {
  id: string;
  firmId: string;
  takaSrNo: string;
  takaMeter: number;
  beamId: string;
  productionInfoId: string;
  createdAt: string;
  updatedAt: string;
  firm?: { firmName: string };
  beam?: { beamNo: string };
  productionInfo?: {
    entryDate: string;
    weight: number;
    machine?: { machineNo: string };
    productionQuality?: { name: string };
  };
};

type TakaListParams = {
  search?: string;
  beam_no?: string;
  meter_min?: number;
  meter_max?: number;
  firmId?: string;
  page?: number;
  limit?: number;
};

export function getTakas(params?: TakaListParams) {
  return getList<Taka>("/takas", params);
}

export function getTaka(id: string) {
  return getOne<Taka>(`/takas/${id}`);
}
