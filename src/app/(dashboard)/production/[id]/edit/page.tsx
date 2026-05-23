"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { ProductionForm } from "@/components/modules/production/ProductionForm";
import { getProduction } from "@/lib/api/production";
import { updateProductionAction } from "@/lib/actions/production.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { UpdateProductionInput } from "@/lib/schemas/production.schema";

function EditProductionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
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

export default function EditProductionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["production", id],
    queryFn: () => getProduction(id),
  });

  async function handleSubmit(data: UpdateProductionInput) {
    setIsSubmitting(true);
    try {
      await updateProductionAction(id, data);
      toast.success("Production record updated");
      await queryClient.invalidateQueries({ queryKey: ["production"] });
      await queryClient.invalidateQueries({ queryKey: ["production", id] });
      router.push(ROUTES.PRODUCTION.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="production" action="edit">
      <PageHeader
        title="Edit Production Record"
        onBack={() => router.back()}
      />
      {isLoading ? (
        <EditProductionSkeleton />
      ) : record ? (
        <ProductionForm
          defaultValues={{
            firmId: record.firmId,
            machineId: record.machineId,
            beamId: record.beamId,
            entryDate: new Date(record.entryDate),
            takaSrNo: record.takaSrNo,
            takaNo: record.takaNo,
            takaMeter: record.takaMeter,
            productionQualityId: record.productionQualityId,
            weight: record.weight,
            remark: record.remark,
            productionChallanNo: record.productionChallanNo,
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          millData={{
            millOutvertDate: record.millOutvertDate,
            millChallanNo: record.millChallanNo,
            millName: record.millName,
          }}
        />
      ) : null}
    </PermissionGate>
  );
}
