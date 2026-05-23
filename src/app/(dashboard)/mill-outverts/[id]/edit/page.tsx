"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MillOutvertForm } from "@/components/modules/mill-info/MillOutvertForm";
import { getMillOutvert } from "@/lib/api/millOutverts";
import { updateMillOutvertAction } from "@/lib/actions/millOutverts.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { UpdateMillOutvertInput } from "@/lib/schemas/millOutvert.schema";

function EditMillOutvertSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
  );
}

export default function EditMillOutvertPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["mill-outvert", id],
    queryFn: () => getMillOutvert(id),
  });

  async function handleSubmit(data: UpdateMillOutvertInput) {
    setIsSubmitting(true);
    try {
      await updateMillOutvertAction(id, data);
      toast.success("Mill outvert updated");
      await queryClient.invalidateQueries({ queryKey: ["mill-outverts"] });
      await queryClient.invalidateQueries({ queryKey: ["mill-outvert", id] });
      router.push(ROUTES.MILL_OUTVERTS.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="mill_outverts" action="edit">
      <PageHeader
        title="Edit Mill Outvert"
        onBack={() => router.back()}
      />
      {isLoading ? (
        <EditMillOutvertSkeleton />
      ) : record ? (
        <MillOutvertForm
          defaultValues={{
            firmId: record.firmId,
            millId: record.millId,
            outvertDate: new Date(record.outvertDate),
            firmChallanNo: record.firmChallanNo,
            takaSrNos: record.outvertTakas?.map((t) => t.takaSrNo) ?? [],
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : null}
    </PermissionGate>
  );
}
