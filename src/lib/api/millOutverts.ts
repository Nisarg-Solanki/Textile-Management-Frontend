import { getList, getOne, post, put, del } from "@/lib/api/request";
import type {
  CreateMillOutvertInput,
  UpdateMillOutvertInput,
} from "@/lib/schemas/millOutvert.schema";

export type MillOutvert = {
  id: string;
  firmId: string;
  millId: string;
  outvertDate: string;
  firmChallanNo: string;
  createdAt: string;
  updatedAt: string;
  firm?: { firmName: string };
  mill?: { millName: string };
  outvertTakas?: Array<{ id: string; takaSrNo: string; takaMeter: number }>;
  productionInfos?: Array<{ id: string; takaSrNo: string }>;
};

type MillOutvertListParams = {
  search?: string;
  millId?: string;
  date_from?: string;
  date_to?: string;
  firmId?: string;
  page?: number;
  limit?: number;
};

export function getMillOutverts(params?: MillOutvertListParams) {
  return getList<MillOutvert>("/mill-outverts", params);
}

export function getMillOutvert(id: string) {
  return getOne<MillOutvert>(`/mill-outverts/${id}`);
}

export function createMillOutvert(data: CreateMillOutvertInput) {
  return post<CreateMillOutvertInput, MillOutvert>("/mill-outverts", data);
}

export function updateMillOutvert(id: string, data: UpdateMillOutvertInput) {
  return put<UpdateMillOutvertInput, MillOutvert>(`/mill-outverts/${id}`, data);
}

export function deleteMillOutvert(id: string) {
  return del(`/mill-outverts/${id}`);
}
