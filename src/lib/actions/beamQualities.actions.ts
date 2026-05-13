"use server";

import {
  createBeamQuality,
  updateBeamQuality,
  deleteBeamQuality,
} from "@/lib/api/beamQualities";
import type { BeamQuality } from "@/lib/api/beamQualities";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import type {
  CreateBeamQualityInput,
  UpdateBeamQualityInput,
} from "@/lib/schemas/beamQuality.schema";

export async function createBeamQualityAction(
  data: CreateBeamQualityInput,
): Promise<BeamQuality> {
  const result = await createBeamQuality(data);
  revalidatePath(ROUTES.BEAM_QUALITIES.LIST);
  return result;
}

export async function updateBeamQualityAction(
  id: string,
  data: UpdateBeamQualityInput,
): Promise<BeamQuality> {
  const result = await updateBeamQuality(id, data);
  revalidatePath(ROUTES.BEAM_QUALITIES.LIST);
  return result;
}

export async function deleteBeamQualityAction(id: string): Promise<void> {
  await deleteBeamQuality(id);
  revalidatePath(ROUTES.BEAM_QUALITIES.LIST);
}
