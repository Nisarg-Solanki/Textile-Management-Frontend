import { getList, getOne, post, put, del } from "@/lib/api/request";
import type {
  CreateMillInvertInput,
  UpdateMillInvertInput,
} from "@/lib/schemas/millInvert.schema";

export type MillInvert = {
  id: string;
  firmId: string;
  millId: string;
  millOutvertId: string;
  invertDate: string;
  millChallanNo: string;
  firmChallanNo: string;
  createdAt: string;
  updatedAt: string;
  firm?: { firmName: string };
  mill?: { millName: string };
  millOutvert?: {
    firmChallanNo: string;
    outvertTakas: Array<{ takaSrNo: string }>;
  };
  invertTakas?: Array<{ id: string; takaSrNo: string }>;
};

type MillInvertListParams = {
  search?: string;
  millId?: string;
  date_from?: string;
  date_to?: string;
  firmId?: string;
  page?: number;
  limit?: number;
};

export function getMillInverts(params?: MillInvertListParams) {
  return getList<MillInvert>("/mill-inverts", params);
}

export function getMillInvert(id: string) {
  return getOne<MillInvert>(`/mill-inverts/${id}`);
}

export function createMillInvert(data: CreateMillInvertInput) {
  return post<CreateMillInvertInput, MillInvert>("/mill-inverts", data);
}

export function updateMillInvert(id: string, data: UpdateMillInvertInput) {
  return put<UpdateMillInvertInput, MillInvert>(`/mill-inverts/${id}`, data);
}

export function deleteMillInvert(id: string) {
  return del(`/mill-inverts/${id}`);
}
