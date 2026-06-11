import { getList, getOne } from "@/lib/api/request";

export type Taka = {
  id: string;
  firmId: string;
  takaSrNo: string;
  takaNo: string;
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
    millOutvertId?: string;
    millOutvertDate?: string;
    millInvertId?: string;
    millInvertDate?: string;
    firmChallanNo?: string;
    millChallanNo?: string;
    millName?: string;
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
  status?: "at_mill" | "returned" | "not_sent";
  page?: number;
  limit?: number;
};

export function getTakas(params?: TakaListParams) {
  return getList<Taka>("/takas", params);
}

export function getTaka(id: string) {
  return getOne<Taka>(`/takas/${id}`);
}
