"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { FormDialog } from "@/components/common/FormDialog";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/InputField";
import { SwitchField } from "@/components/forms/SwitchField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  createBeamQualitySchema,
  updateBeamQualitySchema,
  type CreateBeamQualityInput,
  type UpdateBeamQualityInput,
} from "@/lib/schemas/beamQuality.schema";
import {
  createBeamQualityAction,
  updateBeamQualityAction,
} from "@/lib/actions/beamQualities.actions";
import { showErrorToast } from "@/lib/utils/handleError";

// SwitchField requires a boolean; status in the schema is "active" | "inactive".
// Extend the schema so the form layer works correctly and convert on submit.
const editFormSchema = updateBeamQualitySchema.extend({
  status: z.boolean(),
});
type EditFormValues = z.infer<typeof editFormSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quality?: { id: string; name: string; status: string };
  onSuccess?: (quality: { id: string; name: string }) => void;
};

export function BeamQualityDialog({
  open,
  onOpenChange,
  quality,
  onSuccess,
}: Props) {
  const isEdit = quality !== undefined;

  const createForm = useForm<CreateBeamQualityInput>({
    resolver: zodResolver(createBeamQualitySchema),
    defaultValues: { name: "" },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    values: {
      name: quality?.name ?? "",
      status: quality?.status === "active",
    },
  });

  const isSubmitting = isEdit
    ? editForm.formState.isSubmitting
    : createForm.formState.isSubmitting;

  function handleOpenChange(value: boolean) {
    if (!value) createForm.reset();
    onOpenChange(value);
  }

  async function onCreateSubmit(data: CreateBeamQualityInput) {
    try {
      const result = await createBeamQualityAction(data);
      toast.success("Beam quality created");
      onSuccess?.({ id: result.id, name: result.name });
      createForm.reset();
      onOpenChange(false);
    } catch (err) {
      showErrorToast(err);
    }
  }

  async function onEditSubmit(data: EditFormValues) {
    if (!quality) return;
    try {
      const submitData: UpdateBeamQualityInput = {
        name: data.name,
        status: data.status ? "active" : "inactive",
      };
      await updateBeamQualityAction(quality.id, submitData);
      toast.success("Beam quality updated");
      onOpenChange(false);
    } catch (err) {
      showErrorToast(err);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Edit Beam Quality" : "Add Beam Quality"}
      isLoading={isSubmitting}
    >
      {isEdit ? (
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-4"
          >
            <InputField
              control={editForm.control}
              name="name"
              label="Name"
              placeholder="Enter quality name"
              required
              disabled={isSubmitting}
            />
            <SwitchField
              control={editForm.control}
              name="status"
              label="Active"
              description="Inactive qualities cannot be selected in new records"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <SubmitButton isLoading={isSubmitting}>Save changes</SubmitButton>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <InputField
              control={createForm.control}
              name="name"
              label="Name"
              placeholder="Enter quality name"
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <SubmitButton isLoading={isSubmitting}>Add quality</SubmitButton>
            </div>
          </form>
        </Form>
      )}
    </FormDialog>
  );
}
