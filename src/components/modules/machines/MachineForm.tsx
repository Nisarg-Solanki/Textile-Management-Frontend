"use client";

import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { SwitchField } from "@/components/forms/SwitchField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  createMachineSchema,
  type CreateMachineInput,
} from "@/lib/schemas/machine.schema";
import { getFirms } from "@/lib/api/firms";

// SwitchField binds to a boolean field.value; status in the schema is "active" | "inactive".
// Extend the schema so the form layer works with booleans and convert on submit.
const formSchema = createMachineSchema.extend({ status: z.boolean() });
type FormValues = z.infer<typeof formSchema>;

type Props = {
  defaultValues?: Partial<CreateMachineInput>;
  onSubmit: (data: CreateMachineInput) => Promise<void>;
  isLoading?: boolean;
};

export function MachineForm({ defaultValues, onSubmit, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmId: defaultValues?.firmId ?? "",
      machineNo: defaultValues?.machineNo ?? "",
      machineType: defaultValues?.machineType ?? "",
      remark: defaultValues?.remark ?? "",
      status: (defaultValues?.status ?? "active") === "active",
    },
  });

  const { data: firmsData, isLoading: firmsLoading } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const firmOptions = (firmsData?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  async function handleSubmit(values: FormValues) {
    await onSubmit({
      ...values,
      status: values.status ? "active" : "inactive",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            control={form.control}
            name="firmId"
            label="Firm"
            placeholder="Select a firm"
            options={firmOptions}
            isLoading={firmsLoading}
            required
            disabled={isLoading}
          />
          <InputField
            control={form.control}
            name="machineNo"
            label="Machine No"
            placeholder="Enter machine number"
            required
            disabled={isLoading}
          />
          <InputField
            control={form.control}
            name="machineType"
            label="Machine Type"
            placeholder="Enter machine type"
            disabled={isLoading}
          />
          <SwitchField
            control={form.control}
            name="status"
            label="Active"
            disabled={isLoading}
          />
          <div className="md:col-span-2">
            <InputField
              control={form.control}
              name="remark"
              label="Remark"
              placeholder="Enter remark"
              disabled={isLoading}
            />
          </div>
        </div>
        <SubmitButton isLoading={isLoading}>
          {defaultValues?.machineNo ? "Save Changes" : "Create Machine"}
        </SubmitButton>
      </form>
    </Form>
  );
}
