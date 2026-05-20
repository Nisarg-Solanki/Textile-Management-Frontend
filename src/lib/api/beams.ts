import { getList, getOne, post, put, del } from "@/lib/api/request";
import type { CreateBeamInput, UpdateBeamInput } from "@/lib/schemas/beam.schema";

export type Beam = {
  id: string;
  firmId: string;
  beamNo: string;
  tar: number;
  beamQualityId: string;
  takaQty: number;
  beamMeter: number;
  createdAt: string;
  updatedAt: string;
  firm?: { firmName: string };
  beamQuality?: { id: string; name: string };
};

type BeamListParams = {
  search?: string;
  qualityId?: string;
  meter_min?: number;
  meter_max?: number;
  firmId?: string;
  getAll?: boolean;
  page?: number;
  limit?: number;
};

export function getBeams(params?: BeamListParams) {
  return getList<Beam>("/beams", params);
}

export function getBeam(id: string) {
  return getOne<Beam>(`/beams/${id}`);
}

export function createBeam(data: CreateBeamInput) {
  return post<CreateBeamInput, Beam>("/beams", data);
}

export function updateBeam(id: string, data: UpdateBeamInput) {
  return put<UpdateBeamInput, Beam>(`/beams/${id}`, data);
}

export function deleteBeam(id: string) {
  return del(`/beams/${id}`);
}
