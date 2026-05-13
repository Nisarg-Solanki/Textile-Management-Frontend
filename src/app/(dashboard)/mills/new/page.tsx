"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { MillForm } from "@/components/modules/mills/MillForm";
import { createMillAction } from "@/lib/actions/mills.actions";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { CreateMillInput } from "@/lib/schemas/mill.schema";

export default function NewMillPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreateMillInput) {
    setIsLoading(true);
    try {
      await createMillAction(data);
      toast.success("Mill created successfully");
      router.push(ROUTES.MILLS.LIST);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SuperAdminGate>
      <PageHeader title="Add Mill" backHref={ROUTES.MILLS.LIST} />
      <MillForm onSubmit={handleSubmit} isLoading={isLoading} />
    </SuperAdminGate>
  );
}
