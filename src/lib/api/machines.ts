import { getList, getOne, post, put, del } from "@/lib/api/request";
import type { PaginatedResponse } from "@/lib/api/request";
import type { MachineListParams, CreateMachineBody } from "@/types/app";
import type { CreateMachineInput, UpdateMachineInput } from "@/lib/schemas/machine.schema";

export type Machine = {
  id: string;
  firmId: string;
  machineNo: string;
  machineType: string | null;
  status: "active" | "inactive";
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  firm?: { firmName: string };
};

export function getMachines(
  params?: MachineListParams,
): Promise<PaginatedResponse<Machine>> {
  return getList<Machine>("/machines", params);
}

export function getMachine(id: string): Promise<Machine> {
  return getOne<Machine>(`/machines/${id}`);
}

export function createMachine(data: CreateMachineInput): Promise<Machine> {
  return post<CreateMachineBody, Machine>("/machines", data);
}

export function updateMachine(
  id: string,
  data: UpdateMachineInput,
): Promise<Machine> {
  return put<UpdateMachineInput, Machine>(`/machines/${id}`, data);
}

export function deleteMachine(id: string): Promise<void> {
  return del(`/machines/${id}`);
}
