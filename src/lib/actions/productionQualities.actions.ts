import {
  createProductionQuality,
  updateProductionQuality,
  deleteProductionQuality,
} from "@/lib/api/productionQualities";
import type { ProductionQuality } from "@/lib/api/productionQualities";
import type {
  CreateProductionQualityInput,
  UpdateProductionQualityInput,
} from "@/lib/schemas/productionQuality.schema";

export async function createProductionQualityAction(
  data: CreateProductionQualityInput,
): Promise<ProductionQuality> {
  return createProductionQuality(data);
}

export async function updateProductionQualityAction(
  id: string,
  data: UpdateProductionQualityInput,
): Promise<ProductionQuality> {
  return updateProductionQuality(id, data);
}

export async function deleteProductionQualityAction(id: string): Promise<void> {
  return deleteProductionQuality(id);
}
