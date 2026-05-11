import { getList, getOne, post, put, del } from "@/lib/api/request";
import type { PaginatedResponse } from "@/lib/api/request";
import type { Firm, FirmListParams, CreateFirmBody } from "@/types/app";
import type { CreateFirmInput, UpdateFirmInput } from "@/lib/schemas/firm.schema";

export type { Firm };

export function getFirms(
  params?: FirmListParams,
): Promise<PaginatedResponse<Firm>> {
  return getList<Firm>("/firms", params);
}

export function getFirm(id: string): Promise<Firm> {
  return getOne<Firm>(`/firms/${id}`);
}

export function createFirm(data: CreateFirmInput): Promise<Firm> {
  return post<CreateFirmBody, Firm>("/firms", data);
}

export function updateFirm(id: string, data: UpdateFirmInput): Promise<Firm> {
  return put<UpdateFirmInput, Firm>(`/firms/${id}`, data);
}

export function deleteFirm(id: string): Promise<void> {
  return del(`/firms/${id}`);
}
