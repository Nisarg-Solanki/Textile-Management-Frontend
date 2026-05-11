"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { FirmForm } from "@/components/modules/firms/FirmForm";
import { createFirmAction } from "@/lib/actions/firms.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateFirmInput } from "@/lib/schemas/firm.schema";

export default function NewFirmPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreateFirmInput) {
    setIsLoading(true);
    try {
      await createFirmAction(data);
      toast.success("Firm created successfully");
      router.push(ROUTES.FIRMS.LIST);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SuperAdminGate>
      <PageHeader title="Add Firm" backHref={ROUTES.FIRMS.LIST} />
      <FirmForm onSubmit={handleSubmit} isLoading={isLoading} />
    </SuperAdminGate>
  );
}
