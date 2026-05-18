"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MillOutvertForm } from "@/components/modules/mill-info/MillOutvertForm";
import { createMillOutvertAction } from "@/lib/actions/millOutverts.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMillOutvertInput } from "@/lib/schemas/millOutvert.schema";

export default function NewMillOutvertPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: CreateMillOutvertInput) {
    setIsSubmitting(true);
    try {
      await createMillOutvertAction(data);
      toast.success("Mill outvert created");
      await queryClient.invalidateQueries({ queryKey: ["mill-outverts"] });
      router.push(ROUTES.MILL_OUTVERTS.LIST);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="mill_outverts" action="create">
      <PageHeader title="Add Mill Outvert" backHref={ROUTES.MILL_OUTVERTS.LIST} />
      <MillOutvertForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </PermissionGate>
  );
}
