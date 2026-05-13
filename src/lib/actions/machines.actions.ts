import { createMachine, updateMachine, deleteMachine } from "@/lib/api/machines";
import type { CreateMachineInput, UpdateMachineInput } from "@/lib/schemas/machine.schema";
import type { Machine } from "@/lib/api/machines";

export async function createMachineAction(
  data: CreateMachineInput,
): Promise<Machine> {
  return createMachine(data);
}

export async function updateMachineAction(
  id: string,
  data: UpdateMachineInput,
): Promise<Machine> {
  return updateMachine(id, data);
}

export async function deleteMachineAction(id: string): Promise<void> {
  return deleteMachine(id);
}
