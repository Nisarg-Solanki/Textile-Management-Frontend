import { getList, getOne, post, put, del } from "@/lib/api/request";
import type { PaginatedResponse } from "@/lib/api/request";
import type { Mill, MillListParams, CreateMillBody } from "@/types/app";
import type { CreateMillInput, UpdateMillInput } from "@/lib/schemas/mill.schema";

export type { Mill };

export function getMills(
  params?: MillListParams,
): Promise<PaginatedResponse<Mill>> {
  return getList<Mill>("/mills", params);
}

export function getMill(id: string): Promise<Mill> {
  return getOne<Mill>(`/mills/${id}`);
}

export function createMill(data: CreateMillInput): Promise<Mill> {
  return post<CreateMillBody, Mill>("/mills", data);
}

export function updateMill(id: string, data: UpdateMillInput): Promise<Mill> {
  return put<UpdateMillInput, Mill>(`/mills/${id}`, data);
}

export function deleteMill(id: string): Promise<void> {
  return del(`/mills/${id}`);
}
