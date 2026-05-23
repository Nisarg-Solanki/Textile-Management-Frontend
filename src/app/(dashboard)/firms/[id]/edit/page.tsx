"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { FirmForm } from "@/components/modules/firms/FirmForm";
import { getFirm } from "@/lib/api/firms";
import { updateFirmAction } from "@/lib/actions/firms.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateFirmInput } from "@/lib/schemas/firm.schema";

function EditFirmSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-10 w-28" />
    </div>
  );
}

export default function EditFirmPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: firm, isLoading } = useQuery({
    queryKey: ["firms", id],
    queryFn: () => getFirm(id),
  });

  async function handleSubmit(data: CreateFirmInput) {
    setIsSubmitting(true);
    try {
      await updateFirmAction(id, data);
      toast.success("Firm updated successfully");
      router.push(ROUTES.FIRMS.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SuperAdminGate>
      <PageHeader title="Edit Firm" onBack={() => router.back()} />
      {isLoading ? (
        <EditFirmSkeleton />
      ) : firm ? (
        <FirmForm
          defaultValues={{
            firmName: firm.firmName,
            firmCode: firm.firmCode,
            challanEnable: firm.challanEnable,
            srNoSeries: firm.srNoSeries ?? "",
            address: firm.address ?? "",
            contactPerson: firm.contactPerson ?? "",
            contactNumber: firm.contactNumber ?? "",
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : null}
    </SuperAdminGate>
  );
}
