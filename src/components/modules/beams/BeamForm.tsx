"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { BeamQualityDialog } from "@/components/modules/beam-qualities/BeamQualityDialog";
import { createBeamSchema, type CreateBeamInput } from "@/lib/schemas/beam.schema";
import { getBeamQualities } from "@/lib/api/beamQualities";

type Props = {
  defaultValues?: Partial<CreateBeamInput>;
  onSubmit: (data: CreateBeamInput) => Promise<void>;
  isLoading?: boolean;
};

export function BeamForm({ defaultValues, onSubmit, isLoading }: Props) {
  const queryClient = useQueryClient();
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);

  const form = useForm<CreateBeamInput>({
    resolver: zodResolver(createBeamSchema),
    defaultValues: {
      beamNo: defaultValues?.beamNo ?? "",
      tar: defaultValues?.tar ?? (undefined as unknown as number),
      beamQualityId: defaultValues?.beamQualityId ?? "",
      takaQty: defaultValues?.takaQty ?? (undefined as unknown as number),
      beamMeter: defaultValues?.beamMeter ?? (undefined as unknown as number),
    },
  });

  const { data: qualitiesData, isLoading: qualitiesLoading } = useQuery({
    queryKey: ["beam-qualities-all"],
    queryFn: () => getBeamQualities({ limit: 100 }),
  });

  const qualityOptions = (qualitiesData?.data ?? []).map((q) => ({
    value: q.id,
    label: q.name,
  }));

  function handleQualityCreated(quality: { id: string; name: string }) {
    queryClient.invalidateQueries({ queryKey: ["beam-qualities-all"] });
    form.setValue("beamQualityId", quality.id);
  }

  async function handleSubmit(data: CreateBeamInput) {
    try {
      await onSubmit(data);
      form.reset();
    } catch {
      // parent already showed the error toast — don't reset
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              control={form.control}
              name="beamNo"
              label="Beam No"
              placeholder="Enter beam number"
              required
              disabled={isLoading}
            />
            <SelectField
              control={form.control}
              name="beamQualityId"
              label="Beam Quality"
              placeholder="Select a beam quality"
              options={qualityOptions}
              isLoading={qualitiesLoading}
              required
              disabled={isLoading}
              onAddNew={() => setQualityDialogOpen(true)}
            />
            <InputField
              control={form.control}
              name="tar"
              label="Tar"
              type="number"
              placeholder="Enter tar"
              required
              disabled={isLoading}
            />
            <InputField
              control={form.control}
              name="takaQty"
              label="Taka Quantity"
              type="number"
              placeholder="Enter taka quantity"
              required
              disabled={isLoading}
            />
            <InputField
              control={form.control}
              name="beamMeter"
              label="Beam Meter"
              type="number"
              placeholder="Enter beam meter"
              required
              disabled={isLoading}
            />
          </div>
          <SubmitButton isLoading={isLoading}>
            {defaultValues?.beamNo ? "Save Changes" : "Create Beam"}
          </SubmitButton>
        </form>
      </Form>

      <BeamQualityDialog
        open={qualityDialogOpen}
        onOpenChange={setQualityDialogOpen}
        onSuccess={handleQualityCreated}
      />
    </>
  );
}
