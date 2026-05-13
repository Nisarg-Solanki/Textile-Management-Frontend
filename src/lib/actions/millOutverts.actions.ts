import {
  createMillOutvert,
  updateMillOutvert,
  deleteMillOutvert,
} from "@/lib/api/millOutverts";
import type {
  CreateMillOutvertInput,
  UpdateMillOutvertInput,
} from "@/lib/schemas/millOutvert.schema";

export async function createMillOutvertAction(data: CreateMillOutvertInput) {
  return createMillOutvert(data);
}

export async function updateMillOutvertAction(
  id: string,
  data: UpdateMillOutvertInput,
) {
  return updateMillOutvert(id, data);
}

export async function deleteMillOutvertAction(id: string) {
  return deleteMillOutvert(id);
}
