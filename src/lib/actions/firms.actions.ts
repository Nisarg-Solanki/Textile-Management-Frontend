import { createFirm, updateFirm, deleteFirm } from "@/lib/api/firms";
import type { CreateFirmInput, UpdateFirmInput } from "@/lib/schemas/firm.schema";
import type { Firm } from "@/lib/api/firms";

export async function createFirmAction(data: CreateFirmInput): Promise<Firm> {
  return createFirm(data);
}

export async function updateFirmAction(
  id: string,
  data: UpdateFirmInput,
): Promise<Firm> {
  return updateFirm(id, data);
}

export async function deleteFirmAction(id: string): Promise<void> {
  return deleteFirm(id);
}
