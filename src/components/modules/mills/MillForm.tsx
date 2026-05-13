"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/InputField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  createMillSchema,
  type CreateMillInput,
} from "@/lib/schemas/mill.schema";

type Props = {
  defaultValues?: Partial<CreateMillInput>;
  onSubmit: (data: CreateMillInput) => Promise<void>;
  isLoading?: boolean;
};

export function MillForm({ defaultValues, onSubmit, isLoading }: Props) {
  const form = useForm<CreateMillInput>({
    resolver: zodResolver(createMillSchema),
    defaultValues: {
      millName: "",
      millCode: "",
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
            name="millName"
            label="Mill Name"
            placeholder="Enter mill name"
            required
          />
          <InputField
            control={form.control}
            name="millCode"
            label="Mill Code"
            placeholder="Enter mill code"
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
          {defaultValues ? "Save Changes" : "Create Mill"}
        </SubmitButton>
      </form>
    </Form>
  );
}
