import {
  createMillInvert,
  updateMillInvert,
  deleteMillInvert,
} from "@/lib/api/millInverts";
import type {
  CreateMillInvertInput,
  UpdateMillInvertInput,
} from "@/lib/schemas/millInvert.schema";

export async function createMillInvertAction(data: CreateMillInvertInput) {
  return createMillInvert(data);
}

export async function updateMillInvertAction(
  id: string,
  data: UpdateMillInvertInput,
) {
  return updateMillInvert(id, data);
}

export async function deleteMillInvertAction(id: string) {
  return deleteMillInvert(id);
}
