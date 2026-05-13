import { createMill, updateMill, deleteMill } from "@/lib/api/mills";
import type { CreateMillInput, UpdateMillInput } from "@/lib/schemas/mill.schema";
import type { Mill } from "@/lib/api/mills";

export async function createMillAction(data: CreateMillInput): Promise<Mill> {
  return createMill(data);
}

export async function updateMillAction(
  id: string,
  data: UpdateMillInput,
): Promise<Mill> {
  return updateMill(id, data);
}

export async function deleteMillAction(id: string): Promise<void> {
  return deleteMill(id);
}
