"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ProductionQualityDialog } from "@/components/modules/production-qualities/ProductionQualityDialog";
import { getFirms } from "@/lib/api/firms";
import { getMachines } from "@/lib/api/machines";
import { getBeams } from "@/lib/api/beams";
import { getProductionQualities } from "@/lib/api/productionQualities";
import {
  createProductionSchema,
  type CreateProductionInput,
} from "@/lib/schemas/production.schema";
import { formatDate } from "@/lib/utils/formatDate";

type Props = {
  defaultValues?: Partial<CreateProductionInput>;
  onSubmit: (data: CreateProductionInput) => Promise<void>;
  isLoading?: boolean;
  millData?: {
    millOutvertDate?: string;
    millChallanNo?: string;
    millName?: string;
  };
};

export function ProductionForm({
  defaultValues,
  onSubmit,
  isLoading,
  millData,
}: Props) {
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateProductionInput>({
    resolver: zodResolver(createProductionSchema),
    defaultValues: {
      firmId: defaultValues?.firmId ?? "",
      machineId: defaultValues?.machineId ?? "",
      beamId: defaultValues?.beamId ?? "",
      entryDate: defaultValues?.entryDate ?? new Date(),
      takaSrNo: defaultValues?.takaSrNo ?? "",
      takaNo: defaultValues?.takaNo ?? "",
      takaMeter: defaultValues?.takaMeter,
      productionQualityId: defaultValues?.productionQualityId ?? "",
      weight: defaultValues?.weight,
      remark: defaultValues?.remark ?? "",
      productionChallanNo: defaultValues?.productionChallanNo ?? "",
    },
  });

  const watchedFirmId = form.watch("firmId");
  const selectedFirmId = watchedFirmId || null;

  // Reset dependent fields when firm changes — skip on initial mount to
  // preserve defaultValues when editing an existing record.
  const mountedFirmId = useRef(defaultValues?.firmId ?? "");
  useEffect(() => {
    if (watchedFirmId === mountedFirmId.current) return;
    form.setValue("machineId", "");
  }, [watchedFirmId, form]);

  const firms = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const machines = useQuery({
    queryKey: ["machines-by-firm", selectedFirmId],
    queryFn: () => getMachines({ firmId: selectedFirmId!, limit: 100 }),
    enabled: !!selectedFirmId,
  });

  const beams = useQuery({
    queryKey: ["beams-all"],
    queryFn: () => getBeams({ getAll: true }),
  });

  const qualities = useQuery({
    queryKey: ["production-qualities-active"],
    queryFn: () => getProductionQualities({ status: "active", limit: 100 }),
  });

  const selectedFirm = firms.data?.data.find((f) => f.id === selectedFirmId);

  const firmOptions = (firms.data?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  const machineOptions = (machines.data?.data ?? []).map((m) => ({
    value: m.id,
    label: m.machineNo,
  }));

  const beamOptions = (beams.data?.data ?? []).map((b) => ({
    value: b.id,
    label: b.beamNo,
  }));

  const qualityOptions = (qualities.data?.data ?? []).map((q) => ({
    value: q.id,
    label: q.name,
  }));

  async function handleFormSubmit(data: CreateProductionInput) {
    if (selectedFirm?.challanEnable && !data.productionChallanNo?.trim()) {
      form.setError("productionChallanNo", {
        message: "Challan number is required",
      });
      return;
    }
    try {
      await onSubmit(data);
      form.reset({
        firmId: "",
        machineId: "",
        beamId: "",
        entryDate: new Date(),
        takaSrNo: "",
        takaNo: "",
        takaMeter: undefined,
        productionQualityId: "",
        weight: undefined,
        remark: "",
        productionChallanNo: "",
      });
    } catch {
      // parent already showed the error toast — don't reset
    }
  }

  function handleQualityCreated(newQuality: { id: string; name: string }) {
    queryClient.invalidateQueries({ queryKey: ["production-qualities-active"] });
    form.setValue("productionQualityId", newQuality.id);
    setQualityDialogOpen(false);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Firm + Machine */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              name="firmId"
              control={form.control}
              label="Firm"
              placeholder="Select a firm"
              options={firmOptions}
              isLoading={firms.isLoading}
              required
            />

            <SelectField
              name="machineId"
              control={form.control}
              label="Machine"
              placeholder={
                !selectedFirmId ? "Select a firm first" : "Select a machine"
              }
              options={machineOptions}
              isLoading={machines.isLoading}
              disabled={!selectedFirmId}
              required
            />
          </div>

          {/* Beam — half-width, entryDate — full width */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              name="beamId"
              control={form.control}
              label="Beam"
              placeholder="Select a beam"
              options={beamOptions}
              isLoading={beams.isLoading}
              required
            />
          </div>

          {/* Entry date — full width on all breakpoints */}
          <Controller
            control={form.control}
            name="entryDate"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <Label>
                  Entry Date{" "}
                  <span className="ml-1 text-destructive">*</span>
                </Label>
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick entry date"
                />
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Taka Sr No + Taka No + Taka Meter */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              name="takaSrNo"
              control={form.control}
              label="Taka Sr No"
              placeholder="Enter taka serial number"
              required
            />

            <InputField
              name="takaNo"
              control={form.control}
              label="Taka No"
              placeholder="Enter taka number"
              required
            />

            <InputField
              name="takaMeter"
              control={form.control}
              label="Taka Meter"
              placeholder="Enter taka meter"
              type="number"
              required
            />
          </div>

          {/* Production Quality + Weight */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              name="productionQualityId"
              control={form.control}
              label="Production Quality"
              placeholder="Select a quality"
              options={qualityOptions}
              isLoading={qualities.isLoading}
              required
              onAddNew={() => setQualityDialogOpen(true)}
            />

            <InputField
              name="weight"
              control={form.control}
              label="Weight"
              placeholder="Enter weight"
              type="number"
              required
            />
          </div>

          {/* Challan No — only when firm has challanEnable, required */}
          {selectedFirm?.challanEnable && (
            <InputField
              name="productionChallanNo"
              control={form.control}
              label="Production Challan No"
              placeholder="Enter challan number"
              required
            />
          )}

          {/* Remark — full width */}
          <InputField
            name="remark"
            control={form.control}
            label="Remark"
            placeholder="Enter remark (optional)"
          />

          {/* Auto-filled mill info — always rendered, never editable */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lock className="size-4" /> Mill Information — Auto-filled
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label>Mill Outvert Date</Label>
                <Input
                  disabled
                  value={
                    millData?.millOutvertDate
                      ? formatDate(millData.millOutvertDate)
                      : "—"
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Mill Challan No</Label>
                <Input disabled value={millData?.millChallanNo ?? "—"} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Mill Name</Label>
                <Input disabled value={millData?.millName ?? "—"} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <SubmitButton isLoading={isLoading}>Save</SubmitButton>
          </div>
        </form>
      </Form>

      <ProductionQualityDialog
        open={qualityDialogOpen}
        onOpenChange={setQualityDialogOpen}
        onSuccess={handleQualityCreated}
      />
    </>
  );
}
