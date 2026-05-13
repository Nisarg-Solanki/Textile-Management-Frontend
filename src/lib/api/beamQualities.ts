import { getList, getOne, post, put, del } from "@/lib/api/request";
import type { PaginatedResponse } from "@/lib/api/request";
import type {
  CreateBeamQualityInput,
  UpdateBeamQualityInput,
} from "@/lib/schemas/beamQuality.schema";

export type BeamQuality = {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

type BeamQualityListParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export function getBeamQualities(
  params?: BeamQualityListParams,
): Promise<PaginatedResponse<BeamQuality>> {
  return getList<BeamQuality>("/beam-qualities", params);
}

export function getBeamQuality(id: string): Promise<BeamQuality> {
  return getOne<BeamQuality>(`/beam-qualities/${id}`);
}

export function createBeamQuality(
  data: CreateBeamQualityInput,
): Promise<BeamQuality> {
  return post<CreateBeamQualityInput, BeamQuality>("/beam-qualities", data);
}

export function updateBeamQuality(
  id: string,
  data: UpdateBeamQualityInput,
): Promise<BeamQuality> {
  return put<UpdateBeamQualityInput, BeamQuality>(
    `/beam-qualities/${id}`,
    data,
  );
}

export function deleteBeamQuality(id: string): Promise<void> {
  return del(`/beam-qualities/${id}`);
}
