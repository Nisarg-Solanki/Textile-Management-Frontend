"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { MillForm } from "@/components/modules/mills/MillForm";
import { getMill } from "@/lib/api/mills";
import { updateMillAction } from "@/lib/actions/mills.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMillInput } from "@/lib/schemas/mill.schema";

function EditMillSkeleton() {
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

export default function EditMillPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: mill, isLoading } = useQuery({
    queryKey: ["mills", id],
    queryFn: () => getMill(id),
  });

  async function handleSubmit(data: CreateMillInput) {
    setIsSubmitting(true);
    try {
      await updateMillAction(id, data);
      toast.success("Mill updated successfully");
      router.push(ROUTES.MILLS.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SuperAdminGate>
      <PageHeader title="Edit Mill" onBack={() => router.back()} />
      {isLoading ? (
        <EditMillSkeleton />
      ) : mill ? (
        <MillForm
          defaultValues={{
            millName: mill.millName,
            millCode: mill.millCode ?? "",
            address: mill.address ?? "",
            contactPerson: mill.contactPerson ?? "",
            contactNumber: mill.contactNumber ?? "",
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : null}
    </SuperAdminGate>
  );
}
