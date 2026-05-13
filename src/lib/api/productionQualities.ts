import { getList, getOne, post, put, del } from "@/lib/api/request";
import type { PaginatedResponse } from "@/lib/api/request";
import type {
  CreateProductionQualityInput,
  UpdateProductionQualityInput,
} from "@/lib/schemas/productionQuality.schema";

export type ProductionQuality = {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

type ProductionQualityListParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export function getProductionQualities(
  params?: ProductionQualityListParams,
): Promise<PaginatedResponse<ProductionQuality>> {
  return getList<ProductionQuality>("/production-qualities", params);
}

export function getProductionQuality(id: string): Promise<ProductionQuality> {
  return getOne<ProductionQuality>(`/production-qualities/${id}`);
}

export function createProductionQuality(
  data: CreateProductionQualityInput,
): Promise<ProductionQuality> {
  return post<CreateProductionQualityInput, ProductionQuality>(
    "/production-qualities",
    data,
  );
}

export function updateProductionQuality(
  id: string,
  data: UpdateProductionQualityInput,
): Promise<ProductionQuality> {
  return put<UpdateProductionQualityInput, ProductionQuality>(
    `/production-qualities/${id}`,
    data,
  );
}

export function deleteProductionQuality(id: string): Promise<void> {
  return del(`/production-qualities/${id}`);
}
