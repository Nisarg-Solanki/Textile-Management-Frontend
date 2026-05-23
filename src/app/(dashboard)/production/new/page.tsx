"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionGate } from "@/components/modules/PermissionGate";
import { ProductionForm } from "@/components/modules/production/ProductionForm";
import { createProductionAction } from "@/lib/actions/production.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import type { CreateProductionInput } from "@/lib/schemas/production.schema";

export default function NewProductionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: CreateProductionInput) {
    setIsSubmitting(true);
    try {
      await createProductionAction(data);
      toast.success("Production record created");
      // router.push(ROUTES.PRODUCTION.LIST);
    } catch (err) {
      showErrorToast(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PermissionGate module="production" action="create">
      <PageHeader
        title="Add Production Record"
        onBack={() => router.back()}
      />
      <ProductionForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </PermissionGate>
  );
}
