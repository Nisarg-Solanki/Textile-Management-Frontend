"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { MillInvertForm } from "@/components/modules/mill-info/MillInvertForm";
import { createMillInvertAction } from "@/lib/actions/millInverts.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMillInvertInput } from "@/lib/schemas/millInvert.schema";

export default function NewMillInvertPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: CreateMillInvertInput) {
    setIsSubmitting(true);
    try {
      await createMillInvertAction(data);
      toast.success("Mill invert created");
      await queryClient.invalidateQueries({ queryKey: ["mill-inverts"] });
      router.push(ROUTES.MILL_INVERTS.LIST);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="mill_inverts" action="create">
      <PageHeader title="Add Mill Invert" onBack={() => router.back()} />
      <MillInvertForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </PermissionGate>
  );
}
