"use server";

import { createMill, updateMill, deleteMill } from "@/lib/api/mills";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import type { CreateMillInput, UpdateMillInput } from "@/lib/schemas/mill.schema";
import type { Mill } from "@/lib/api/mills";

export async function createMillAction(data: CreateMillInput): Promise<Mill> {
  const result = await createMill(data);
  revalidatePath(ROUTES.MILLS.LIST);
  return result;
}

export async function updateMillAction(
  id: string,
  data: UpdateMillInput,
): Promise<Mill> {
  const result = await updateMill(id, data);
  revalidatePath(ROUTES.MILLS.LIST);
  revalidatePath(ROUTES.MILLS.DETAIL(id));
  return result;
}

export async function deleteMillAction(id: string): Promise<void> {
  await deleteMill(id);
  revalidatePath(ROUTES.MILLS.LIST);
}
