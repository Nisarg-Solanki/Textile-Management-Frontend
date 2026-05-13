"use server";

import {
  createProductionQuality,
  updateProductionQuality,
  deleteProductionQuality,
} from "@/lib/api/productionQualities";
import type { ProductionQuality } from "@/lib/api/productionQualities";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import type {
  CreateProductionQualityInput,
  UpdateProductionQualityInput,
} from "@/lib/schemas/productionQuality.schema";

export async function createProductionQualityAction(
  data: CreateProductionQualityInput,
): Promise<ProductionQuality> {
  const result = await createProductionQuality(data);
  revalidatePath(ROUTES.PRODUCTION_QUALITIES.LIST);
  return result;
}

export async function updateProductionQualityAction(
  id: string,
  data: UpdateProductionQualityInput,
): Promise<ProductionQuality> {
  const result = await updateProductionQuality(id, data);
  revalidatePath(ROUTES.PRODUCTION_QUALITIES.LIST);
  return result;
}

export async function deleteProductionQualityAction(id: string): Promise<void> {
  await deleteProductionQuality(id);
  revalidatePath(ROUTES.PRODUCTION_QUALITIES.LIST);
}
