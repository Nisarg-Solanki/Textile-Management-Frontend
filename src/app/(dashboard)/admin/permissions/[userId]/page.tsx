"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionMatrix } from "@/components/modules/permissions/PermissionMatrix";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { getPermissions } from "@/lib/api/permissions";
import { updatePermissionsAction } from "@/lib/actions/permissions.actions";
import { updatePermissionsSchema } from "@/lib/schemas/permission.schema";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";

const formSchema = z.object({
  permissions: updatePermissionsSchema,
});

type FormValues = z.infer<typeof formSchema>;

export default function ManagePermissionsPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["permissions", userId],
    queryFn: () => getPermissions(userId),
    enabled: !!userId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { permissions: [] },
  });

  const { control, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (queryData) {
      reset({ permissions: queryData });
    }
  }, [queryData, reset]);

  async function onSubmit(data: FormValues): Promise<void> {
    try {
      await updatePermissionsAction(userId, data.permissions);
      toast.success("Permissions updated");
    } catch (err) {
      showErrorToast(err);
    }
  }

  return (
    <SuperAdminGate>
      <PageHeader
        title="Manage Permissions"
        backHref={ROUTES.ADMIN.PENDING_USERS}
      />

      {isLoading && (
        <div className="space-y-px overflow-hidden rounded-md border">
          <Skeleton className="h-11 w-full rounded-none" />
          <Skeleton className="h-9 w-full rounded-none" />
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-none" />
          ))}
        </div>
      )}

      {!isLoading && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PermissionMatrix control={control} name="permissions" />
            <div className="flex justify-end">
              <SubmitButton isLoading={formState.isSubmitting}>
                Save Permissions
              </SubmitButton>
            </div>
          </form>
        </Form>
      )}
    </SuperAdminGate>
  );
}
