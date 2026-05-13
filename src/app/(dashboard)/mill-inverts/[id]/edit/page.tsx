"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MillInvertForm } from "@/components/modules/mill-info/MillInvertForm";
import { getMillInvert } from "@/lib/api/millInverts";
import { updateMillInvertAction } from "@/lib/actions/millInverts.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMillInvertInput } from "@/lib/schemas/millInvert.schema";

function EditMillInvertSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
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

export default function EditMillInvertPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["mill-invert", id],
    queryFn: () => getMillInvert(id),
  });

  async function handleSubmit(data: CreateMillInvertInput) {
    setIsSubmitting(true);
    try {
      await updateMillInvertAction(id, data);
      toast.success("Mill invert updated");
      await queryClient.invalidateQueries({ queryKey: ["mill-inverts"] });
      await queryClient.invalidateQueries({ queryKey: ["mill-invert", id] });
      router.push(ROUTES.MILL_INVERTS.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="mill_inverts" action="edit">
      <PageHeader
        title="Edit Mill Invert"
        backHref={ROUTES.MILL_INVERTS.DETAIL(id)}
      />
      {isLoading ? (
        <EditMillInvertSkeleton />
      ) : record ? (
        <MillInvertForm
          defaultValues={{
            firmId: record.firmId,
            millId: record.millId,
            millOutvertId: record.millOutvertId,
            invertDate: new Date(record.invertDate),
            millChallanNo: record.millChallanNo,
            firmChallanNo: record.firmChallanNo,
            takaSrNos: record.invertTakas?.map((t) => t.takaSrNo) ?? [],
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : null}
    </PermissionGate>
  );
}
