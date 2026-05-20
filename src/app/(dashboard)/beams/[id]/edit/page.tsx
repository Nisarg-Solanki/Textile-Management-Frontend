"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { BeamForm } from "@/components/modules/beams/BeamForm";
import { getBeam } from "@/lib/api/beams";
import { updateBeamAction } from "@/lib/actions/beams.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { UpdateBeamInput } from "@/lib/schemas/beam.schema";

function EditBeamSkeleton() {
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
      <Skeleton className="h-10 w-28" />
    </div>
  );
}

export default function EditBeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: beam, isLoading } = useQuery({
    queryKey: ["beam", id],
    queryFn: () => getBeam(id),
  });

  async function handleSubmit(data: UpdateBeamInput) {
    setIsSubmitting(true);
    try {
      await updateBeamAction(id, data);
      toast.success("Beam updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["beams"] });
      await queryClient.invalidateQueries({ queryKey: ["beam", id] });
      router.push(ROUTES.BEAMS.DETAIL(id));
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="beams" action="edit">
      <PageHeader title="Edit Beam" backHref={ROUTES.BEAMS.DETAIL(id)} />
      {isLoading ? (
        <EditBeamSkeleton />
      ) : beam ? (
        <BeamForm
          defaultValues={{
            beamNo: beam.beamNo,
            tar: beam.tar,
            beamQualityId: beam.beamQualityId,
            takaQty: beam.takaQty,
            beamMeter: beam.beamMeter,
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : null}
    </PermissionGate>
  );
}
