import {
  createBeamQuality,
  updateBeamQuality,
  deleteBeamQuality,
} from "@/lib/api/beamQualities";
import type { BeamQuality } from "@/lib/api/beamQualities";
import type {
  CreateBeamQualityInput,
  UpdateBeamQualityInput,
} from "@/lib/schemas/beamQuality.schema";

export async function createBeamQualityAction(
  data: CreateBeamQualityInput,
): Promise<BeamQuality> {
  return createBeamQuality(data);
}

export async function updateBeamQualityAction(
  id: string,
  data: UpdateBeamQualityInput,
): Promise<BeamQuality> {
  return updateBeamQuality(id, data);
}

export async function deleteBeamQualityAction(id: string): Promise<void> {
  return deleteBeamQuality(id);
}
