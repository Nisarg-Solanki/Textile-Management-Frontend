"use server";

import { createFirm, updateFirm, deleteFirm } from "@/lib/api/firms";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import type { CreateFirmInput, UpdateFirmInput } from "@/lib/schemas/firm.schema";
import type { Firm } from "@/lib/api/firms";

export async function createFirmAction(data: CreateFirmInput): Promise<Firm> {
  const result = await createFirm(data);
  revalidatePath(ROUTES.FIRMS.LIST);
  return result;
}

export async function updateFirmAction(
  id: string,
  data: UpdateFirmInput,
): Promise<Firm> {
  const result = await updateFirm(id, data);
  revalidatePath(ROUTES.FIRMS.LIST);
  revalidatePath(ROUTES.FIRMS.DETAIL(id));
  return result;
}

export async function deleteFirmAction(id: string): Promise<void> {
  await deleteFirm(id);
  revalidatePath(ROUTES.FIRMS.LIST);
}
