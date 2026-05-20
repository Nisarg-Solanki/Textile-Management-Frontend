"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { getFirms } from "@/lib/api/firms";
import { getMills } from "@/lib/api/mills";
import { getTakas } from "@/lib/api/takas";
import {
  createMillOutvertSchema,
  type CreateMillOutvertInput,
} from "@/lib/schemas/millOutvert.schema";
import { cn } from "@/lib/utils/cn";

type Props = {
  defaultValues?: Partial<CreateMillOutvertInput>;
  onSubmit: (data: CreateMillOutvertInput) => Promise<void>;
  isLoading?: boolean;
};

export function MillOutvertForm({ defaultValues, onSubmit, isLoading }: Props) {
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(
    defaultValues?.firmId ?? null,
  );
  const [firmPopoverOpen, setFirmPopoverOpen] = useState(false);
  const [takaPopoverOpen, setTakaPopoverOpen] = useState(false);

  const form = useForm<CreateMillOutvertInput>({
    resolver: zodResolver(createMillOutvertSchema),
    defaultValues: {
      firmId: defaultValues?.firmId ?? "",
      millId: defaultValues?.millId ?? "",
      outvertDate: defaultValues?.outvertDate ?? new Date(),
      firmChallanNo: defaultValues?.firmChallanNo ?? "",
      takaSrNos: defaultValues?.takaSrNos ?? [],
    },
  });

  const { data: firmsData, isLoading: firmsLoading } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
  });

  const { data: millsData, isLoading: millsLoading } = useQuery({
    queryKey: ["mills-active"],
    queryFn: () => getMills({ status: "active", limit: 100 }),
  });

  const { data: takasData, isLoading: takasLoading } = useQuery({
    queryKey: ["takas-by-firm", selectedFirmId],
    queryFn: () => getTakas({ firmId: selectedFirmId!, limit: 200 }),
    enabled: !!selectedFirmId,
  });

  const firmOptions = (firmsData?.data ?? []).map((f) => ({
    value: f.id,
    label: f.firmName,
  }));

  const millOptions = (millsData?.data ?? []).map((m) => ({
    value: m.id,
    label: m.millName,
  }));

  const takaItems = takasData?.data ?? [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Firm — custom field to handle selectedFirmId + takaSrNos reset */}
          <FormField
            control={form.control}
            name="firmId"
            render={({ field }) => {
              const selectedLabel = firmOptions.find(
                (o) => o.value === field.value,
              )?.label;

              return (
                <FormItem>
                  <FormLabel>
                    Firm
                    <span className="ml-1 text-destructive">*</span>
                  </FormLabel>
                  <Popover
                    open={firmPopoverOpen}
                    onOpenChange={setFirmPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={firmPopoverOpen}
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {selectedLabel ?? "Select a firm"}
                          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search firms..." />
                        <CommandList>
                          {!firmsLoading && (
                            <CommandEmpty>No firms found.</CommandEmpty>
                          )}
                          <CommandGroup>
                            {firmsLoading ? (
                              <>
                                <div className="px-2 py-1.5">
                                  <Skeleton className="h-6 w-full" />
                                </div>
                                <div className="px-2 py-1.5">
                                  <Skeleton className="h-6 w-full" />
                                </div>
                              </>
                            ) : (
                              firmOptions.map((option) => (
                                <CommandItem
                                  key={option.value}
                                  value={option.label}
                                  onSelect={() => {
                                    field.onChange(option.value);
                                    setSelectedFirmId(option.value);
                                    form.setValue("takaSrNos", []);
                                    setFirmPopoverOpen(false);
                                  }}
                                >
                                  {option.label}
                                  <Check
                                    className={cn(
                                      "ml-auto size-4",
                                      field.value === option.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <SelectField
            name="millId"
            control={form.control}
            label="Mill"
            placeholder="Select a mill"
            options={millOptions}
            isLoading={millsLoading}
            required
          />

          <FormField
            control={form.control}
            name="outvertDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Outvert Date
                  <span className="ml-1 text-destructive">*</span>
                </FormLabel>
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick outvert date"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <InputField
            name="firmChallanNo"
            control={form.control}
            label="Firm Challan No"
            placeholder="Enter challan number"
            required
          />
        </div>

        {/* Taka Sr Nos — multi-select */}
        <FormField
          control={form.control}
          name="takaSrNos"
          render={({ field }) => {
            const currentValue: string[] = field.value ?? [];

            function toggleTaka(takaSrNo: string) {
              const next = currentValue.includes(takaSrNo)
                ? currentValue.filter((v) => v !== takaSrNo)
                : [...currentValue, takaSrNo];
              form.setValue("takaSrNos", next, { shouldValidate: true });
            }

            function removeTaka(takaSrNo: string) {
              form.setValue(
                "takaSrNos",
                currentValue.filter((v) => v !== takaSrNo),
                { shouldValidate: true },
              );
            }

            return (
              <FormItem>
                <FormLabel>
                  Taka Sr Nos
                  <span className="ml-1 text-destructive">*</span>
                </FormLabel>

                <Popover
                  open={takaPopoverOpen}
                  onOpenChange={setTakaPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={!selectedFirmId}
                      className={cn(
                        "w-full justify-between font-normal",
                        currentValue.length === 0 && "text-muted-foreground",
                      )}
                    >
                      {!selectedFirmId
                        ? "Select a firm first"
                        : currentValue.length === 0
                          ? "Select takas..."
                          : `${currentValue.length} taka(s) selected`}
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search taka Sr No..." />
                      <CommandList>
                        {!takasLoading && takaItems.length === 0 && (
                          <CommandEmpty>No takas found for this firm.</CommandEmpty>
                        )}
                        <CommandGroup>
                          {takasLoading ? (
                            <>
                              <div className="px-2 py-1.5">
                                <Skeleton className="h-6 w-full" />
                              </div>
                              <div className="px-2 py-1.5">
                                <Skeleton className="h-6 w-full" />
                              </div>
                            </>
                          ) : (
                            takaItems.map((taka) => (
                              <CommandItem
                                key={taka.id}
                                value={taka.takaSrNo}
                                onSelect={() => toggleTaka(taka.takaSrNo)}
                              >
                                <Checkbox
                                  checked={currentValue.includes(taka.takaSrNo)}
                                  className="mr-2"
                                  tabIndex={-1}
                                />
                                {taka.takaSrNo}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {currentValue.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentValue.map((srNo) => (
                      <Badge key={srNo} variant="secondary" className="gap-1">
                        {srNo}
                        <button
                          type="button"
                          aria-label={`Remove taka ${srNo}`}
                          onClick={() => removeTaka(srNo)}
                          className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <SubmitButton isLoading={isLoading}>
          {defaultValues ? "Save Changes" : "Create Mill Outvert"}
        </SubmitButton>
      </form>
    </Form>
  );
}
