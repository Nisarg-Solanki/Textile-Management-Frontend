"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MachineForm } from "@/components/modules/machines/MachineForm";
import { getMachine } from "@/lib/api/machines";
import { updateMachineAction } from "@/lib/actions/machines.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMachineInput } from "@/lib/schemas/machine.schema";

function EditMachineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-28" />
    </div>
  );
}

export default function EditMachinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: machine, isLoading } = useQuery({
    queryKey: ["machines", id],
    queryFn: () => getMachine(id),
  });

  async function handleSubmit(data: CreateMachineInput) {
    setIsSubmitting(true);
    try {
      await updateMachineAction(id, data);
      toast.success("Machine updated successfully");
      router.push(ROUTES.MACHINES.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="machines" action="edit">
      <PageHeader title="Edit Machine" onBack={() => router.back()} />
      {isLoading ? (
        <EditMachineSkeleton />
      ) : machine ? (
        <MachineForm
          defaultValues={{
            firmId: machine.firmId,
            machineNo: machine.machineNo,
            machineType: machine.machineType ?? "",
            remark: machine.remark ?? "",
            status: machine.status,
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : null}
    </PermissionGate>
  );
}
