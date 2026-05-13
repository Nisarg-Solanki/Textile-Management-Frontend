import {
  createProduction,
  updateProduction,
  deleteProduction,
} from "@/lib/api/production";
import type {
  CreateProductionInput,
  UpdateProductionInput,
} from "@/lib/schemas/production.schema";

export async function createProductionAction(data: CreateProductionInput) {
  return createProduction(data);
}

export async function updateProductionAction(
  id: string,
  data: UpdateProductionInput,
) {
  return updateProduction(id, data);
}

export async function deleteProductionAction(id: string) {
  return deleteProduction(id);
}
