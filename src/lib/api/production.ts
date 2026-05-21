import { getList, getOne, post, put, del } from "@/lib/api/request";
import type {
  CreateProductionInput,
  UpdateProductionInput,
} from "@/lib/schemas/production.schema";

export type ProductionInfo = {
  id: string;
  firmId: string;
  machineId: string;
  beamId: string;
  entryDate: string;
  takaSrNo: string;
  takaNo: string;
  takaMeter: number;
  productionQualityId: string;
  weight: number;
  remark?: string;
  productionChallanNo?: string;
  millOutvertId?: string;
  millInvertId?: string;
  millOutvertDate?: string;
  millChallanNo?: string;
  millName?: string;
  createdAt: string;
  updatedAt: string;
  firm?: { firmName: string; challanEnable: boolean };
  machine?: { machineNo: string };
  beam?: { beamNo: string };
  productionQuality?: { id: string; name: string };
};

type ProductionListParams = {
  search?: string;
  machineId?: string;
  beamId?: string;
  date_from?: string;
  date_to?: string;
  qualityId?: string;
  firmId?: string;
  page?: number;
  limit?: number;
};

export function getProductions(params?: ProductionListParams) {
  return getList<ProductionInfo>("/production", params);
}

export function getProduction(id: string) {
  return getOne<ProductionInfo>(`/production/${id}`);
}

export function createProduction(data: CreateProductionInput) {
  return post<CreateProductionInput, ProductionInfo>("/production", data);
}

export function updateProduction(id: string, data: UpdateProductionInput) {
  return put<UpdateProductionInput, ProductionInfo>(`/production/${id}`, data);
}

export function deleteProduction(id: string) {
  return del(`/production/${id}`);
}
