"use server";

import { createMachine, updateMachine, deleteMachine } from "@/lib/api/machines";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import type { CreateMachineInput, UpdateMachineInput } from "@/lib/schemas/machine.schema";
import type { Machine } from "@/lib/api/machines";

export async function createMachineAction(
  data: CreateMachineInput,
): Promise<Machine> {
  const result = await createMachine(data);
  revalidatePath(ROUTES.MACHINES.LIST);
  return result;
}

export async function updateMachineAction(
  id: string,
  data: UpdateMachineInput,
): Promise<Machine> {
  const result = await updateMachine(id, data);
  revalidatePath(ROUTES.MACHINES.LIST);
  revalidatePath(ROUTES.MACHINES.DETAIL(id));
  return result;
}

export async function deleteMachineAction(id: string): Promise<void> {
  await deleteMachine(id);
  revalidatePath(ROUTES.MACHINES.LIST);
}
