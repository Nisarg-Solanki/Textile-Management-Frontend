"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { BeamForm } from "@/components/modules/beams/BeamForm";
import { createBeamAction } from "@/lib/actions/beams.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateBeamInput } from "@/lib/schemas/beam.schema";

export default function NewBeamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreateBeamInput) {
    setIsLoading(true);
    try {
      await createBeamAction(data);
      toast.success("Beam created successfully");
      router.push(ROUTES.BEAMS.LIST);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PermissionGate module="beams" action="create">
      <PageHeader title="Add Beam" backHref={ROUTES.BEAMS.LIST} />
      <BeamForm onSubmit={handleSubmit} isLoading={isLoading} />
    </PermissionGate>
  );
}
