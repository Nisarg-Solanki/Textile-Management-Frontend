"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/InputField";
import { SwitchField } from "@/components/forms/SwitchField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  createFirmSchema,
  type CreateFirmInput,
} from "@/lib/schemas/firm.schema";

type Props = {
  defaultValues?: Partial<CreateFirmInput>;
  onSubmit: (data: CreateFirmInput) => Promise<void>;
  isLoading?: boolean;
};

export function FirmForm({ defaultValues, onSubmit, isLoading }: Props) {
  const form = useForm<CreateFirmInput>({
    resolver: zodResolver(createFirmSchema),
    defaultValues: {
      firmName: "",
      firmCode: "",
      challanEnable: false,
      srNoSeries: "",
      address: "",
      contactPerson: "",
      contactNumber: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            control={form.control}
            name="firmName"
            label="Firm Name"
            placeholder="Enter firm name"
            required
          />
          <InputField
            control={form.control}
            name="firmCode"
            label="Firm Code"
            placeholder="Enter firm code"
            required
          />
          <div className="md:col-span-2">
            <SwitchField
              control={form.control}
              name="challanEnable"
              label="Enable Challan"
              description="When enabled, production records will require a challan number"
            />
          </div>
          <InputField
            control={form.control}
            name="srNoSeries"
            label="Sr. No. Series"
            placeholder="e.g. A, B, 001"
          />
          <InputField
            control={form.control}
            name="address"
            label="Address"
            placeholder="Enter address"
          />
          <InputField
            control={form.control}
            name="contactPerson"
            label="Contact Person"
            placeholder="Enter contact person name"
          />
          <InputField
            control={form.control}
            name="contactNumber"
            label="Contact Number"
            placeholder="Enter contact number"
            type="tel"
          />
        </div>
        <SubmitButton isLoading={isLoading}>
          {defaultValues ? "Save Changes" : "Create Firm"}
        </SubmitButton>
      </form>
    </Form>
  );
}
