"use client";

import { useMemo } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { SwitchField } from "@/components/forms/SwitchField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { OrderedFields } from "@/components/forms/OrderedFields";
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
    try {
      await onSubmit({
        ...values,
        status: values.status ? "active" : "inactive",
      });
      form.reset();
    } catch {
      // parent already showed the error toast — don't reset
    }
  }

  const fields = useMemo(
    () => [
      {
        id: "firmId",
        label: "Firm",
        render: () => (
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
        ),
      },
      {
        id: "machineNo",
        label: "Machine No",
        render: () => (
          <InputField
            control={form.control}
            name="machineNo"
            label="Machine No"
            placeholder="Enter machine number"
            required
            disabled={isLoading}
          />
        ),
      },
      {
        id: "machineType",
        label: "Machine Type",
        render: () => (
          <InputField
            control={form.control}
            name="machineType"
            label="Machine Type"
            placeholder="Enter machine type"
            disabled={isLoading}
          />
        ),
      },
      {
        id: "status",
        label: "Active",
        render: () => (
          <SwitchField
            control={form.control}
            name="status"
            label="Active"
            disabled={isLoading}
          />
        ),
      },
      {
        id: "remark",
        label: "Remark",
        fullWidth: true,
        render: () => (
          <InputField
            control={form.control}
            name="remark"
            label="Remark"
            placeholder="Enter remark"
            disabled={isLoading}
          />
        ),
      },
    ],
    [form.control, firmOptions, firmsLoading, isLoading],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <OrderedFields formId="machine-form" fields={fields} gridCols={2} />
        <SubmitButton isLoading={isLoading}>
          {defaultValues?.machineNo ? "Save Changes" : "Create Machine"}
        </SubmitButton>
      </form>
    </Form>
  );
}
