import { createBeam, updateBeam, deleteBeam } from "@/lib/api/beams";
import type { CreateBeamInput, UpdateBeamInput } from "@/lib/schemas/beam.schema";

export async function createBeamAction(data: CreateBeamInput) {
  return createBeam(data);
}

export async function updateBeamAction(id: string, data: UpdateBeamInput) {
  return updateBeam(id, data);
}

export async function deleteBeamAction(id: string) {
  return deleteBeam(id);
}
