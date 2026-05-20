"use client";

import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SelectField } from "@/components/forms/SelectField";
import { InputField } from "@/components/forms/InputField";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { getFirms } from "@/lib/api/firms";
import { getMills } from "@/lib/api/mills";
import { getMillOutverts } from "@/lib/api/millOutverts";
import type { MillOutvert } from "@/lib/api/millOutverts";
import {
  createMillInvertSchema,
  type CreateMillInvertInput,
} from "@/lib/schemas/millInvert.schema";
import { cn } from "@/lib/utils/cn";

type Props = {
  defaultValues?: Partial<CreateMillInvertInput>;
  onSubmit: (data: CreateMillInvertInput) => Promise<void>;
  isLoading?: boolean;
};

export function MillInvertForm({ defaultValues, onSubmit, isLoading }: Props) {
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(
    defaultValues?.firmId ?? null,
  );
  const [firmPopoverOpen, setFirmPopoverOpen] = useState(false);
  const [outvertPopoverOpen, setOutvertPopoverOpen] = useState(false);
  const [takaPopoverOpen, setTakaPopoverOpen] = useState(false);

  const form = useForm<CreateMillInvertInput>({
    resolver: zodResolver(createMillInvertSchema),
    defaultValues: {
      firmId: defaultValues?.firmId ?? "",
      millId: defaultValues?.millId ?? "",
      millOutvertId: defaultValues?.millOutvertId ?? "",
      invertDate: defaultValues?.invertDate ?? new Date(),
      millChallanNo: defaultValues?.millChallanNo ?? "",
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

  const { data: overtsData, isLoading: overtsLoading } = useQuery({
    queryKey: ["mill-outverts-by-firm", selectedFirmId],
    queryFn: () => getMillOutverts({ firmId: selectedFirmId!, limit: 100 }),
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

  const outvertOptions = (overtsData?.data ?? []).map((o) => ({
    value: o.id,
    label: o.firmChallanNo,
  }));

  const millOutvertId = form.watch("millOutvertId");
  const currentOutvert = useMemo<MillOutvert | null>(
    () => overtsData?.data.find((o) => o.id === millOutvertId) ?? null,
    [millOutvertId, overtsData],
  );

  const takaOptions =
    currentOutvert?.outvertTakas?.map((t) => t.takaSrNo) ?? [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Firm — custom popover to handle cascading resets */}
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
                                    form.setValue("millOutvertId", "");
                                    form.setValue("firmChallanNo", "");
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

          {/* Mill Outvert — cascades firmChallanNo and resets takaSrNos */}
          <FormField
            control={form.control}
            name="millOutvertId"
            render={({ field }) => {
              const selectedLabel = outvertOptions.find(
                (o) => o.value === field.value,
              )?.label;

              return (
                <FormItem>
                  <FormLabel>
                    Mill Outvert (Challan)
                    <span className="ml-1 text-destructive">*</span>
                  </FormLabel>
                  <Popover
                    open={outvertPopoverOpen}
                    onOpenChange={setOutvertPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          disabled={!selectedFirmId}
                          aria-expanded={outvertPopoverOpen}
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {!selectedFirmId
                            ? "Select a firm first"
                            : (selectedLabel ?? "Select an outvert")}
                          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search challan no..." />
                        <CommandList>
                          {!overtsLoading && (
                            <CommandEmpty>No outverts found.</CommandEmpty>
                          )}
                          <CommandGroup>
                            {overtsLoading ? (
                              <>
                                <div className="px-2 py-1.5">
                                  <Skeleton className="h-6 w-full" />
                                </div>
                                <div className="px-2 py-1.5">
                                  <Skeleton className="h-6 w-full" />
                                </div>
                              </>
                            ) : (
                              outvertOptions.map((option) => (
                                <CommandItem
                                  key={option.value}
                                  value={option.label}
                                  onSelect={() => {
                                    const found = overtsData?.data.find(
                                      (o) => o.id === option.value,
                                    );
                                    field.onChange(option.value);
                                    form.setValue(
                                      "firmChallanNo",
                                      found?.firmChallanNo ?? "",
                                    );
                                    form.setValue("takaSrNos", []);
                                    setOutvertPopoverOpen(false);
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

          {/* Firm Challan No — display only, value owned by RHF via setValue */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Firm Challan No
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (auto-filled from outvert)
              </span>
            </Label>
            <Input
              disabled
              value={form.watch("firmChallanNo") || "—"}
              className="bg-muted/50"
            />
          </div>

          <FormField
            control={form.control}
            name="invertDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Invert Date
                  <span className="ml-1 text-destructive">*</span>
                </FormLabel>
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick invert date"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <InputField
            name="millChallanNo"
            control={form.control}
            label="Mill Challan No"
            placeholder="Enter mill challan number"
            required
          />
        </div>

        {/* Taka Sr Nos — options are ONLY takas from the selected outvert */}
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
                      disabled={!currentOutvert}
                      className={cn(
                        "w-full justify-between font-normal",
                        currentValue.length === 0 && "text-muted-foreground",
                      )}
                    >
                      {!currentOutvert
                        ? "Select an outvert first"
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
                        {takaOptions.length === 0 && (
                          <CommandEmpty>
                            No takas in this outvert.
                          </CommandEmpty>
                        )}
                        <CommandGroup>
                          {takaOptions.map((srNo) => (
                            <CommandItem
                              key={srNo}
                              value={srNo}
                              onSelect={() => toggleTaka(srNo)}
                            >
                              <Checkbox
                                checked={currentValue.includes(srNo)}
                                className="mr-2"
                                tabIndex={-1}
                              />
                              {srNo}
                            </CommandItem>
                          ))}
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
                          className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
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
          {defaultValues ? "Save Changes" : "Create Mill Invert"}
        </SubmitButton>
      </form>
    </Form>
  );
}
