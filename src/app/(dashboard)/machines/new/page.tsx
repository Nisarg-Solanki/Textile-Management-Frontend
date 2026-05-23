"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MachineForm } from "@/components/modules/machines/MachineForm";
import { createMachineAction } from "@/lib/actions/machines.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMachineInput } from "@/lib/schemas/machine.schema";

export default function NewMachinePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreateMachineInput) {
    setIsLoading(true);
    try {
      await createMachineAction(data);
      toast.success("Machine created successfully");
      // router.push(ROUTES.MACHINES.LIST);
    } catch (err) {
      showErrorToast(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PermissionGate module="machines" action="create">
      <PageHeader title="Add Machine" onBack={() => router.back()} />
      <MachineForm onSubmit={handleSubmit} isLoading={isLoading} />
    </PermissionGate>
  );
}
