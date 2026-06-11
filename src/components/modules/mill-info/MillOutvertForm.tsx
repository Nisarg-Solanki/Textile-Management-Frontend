"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
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
import { OrderedFields } from "@/components/forms/OrderedFields";
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
  const [takaSearch, setTakaSearch] = useState("");
  const [debouncedTakaSearch, setDebouncedTakaSearch] = useState("");

  // Debounce taka search input by 300ms
  const takaSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (takaSearchTimer.current) clearTimeout(takaSearchTimer.current);
    takaSearchTimer.current = setTimeout(() => {
      setDebouncedTakaSearch(takaSearch);
    }, 300);
    return () => {
      if (takaSearchTimer.current) clearTimeout(takaSearchTimer.current);
    };
  }, [takaSearch]);

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
    queryKey: ["takas-by-firm", selectedFirmId, debouncedTakaSearch],
    queryFn: () =>
      getTakas({
        firmId: selectedFirmId!,
        search: debouncedTakaSearch || undefined,
        limit: 200,
      }),
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

  const takaItems = useMemo(() => takasData?.data ?? [], [takasData]);

  const fields = useMemo(
    () => [
      {
        id: "firmId",
        label: "Firm",
        render: () => (
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
                                    setTakaSearch("");
                                    setDebouncedTakaSearch("");
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
        ),
      },
      {
        id: "millId",
        label: "Mill",
        render: () => (
          <SelectField
            name="millId"
            control={form.control}
            label="Mill"
            placeholder="Select a mill"
            options={millOptions}
            isLoading={millsLoading}
            required
          />
        ),
      },
      {
        id: "outvertDate",
        label: "Outvert Date",
        render: () => (
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
        ),
      },
      {
        id: "firmChallanNo",
        label: "Firm Challan No",
        render: () => (
          <InputField
            name="firmChallanNo"
            control={form.control}
            label="Firm Challan No"
            placeholder="Enter challan number"
            required
          />
        ),
      },
      {
        id: "takaSrNos",
        label: "Taka Sr Nos",
        fullWidth: true,
        render: () => (
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
                          currentValue.length === 0 &&
                            "text-muted-foreground",
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
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search taka Sr No..."
                          value={takaSearch}
                          onValueChange={setTakaSearch}
                        />
                        <CommandList>
                          {!takasLoading && takaItems.length === 0 && (
                            <CommandEmpty>
                              No takas found for this firm.
                            </CommandEmpty>
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
                              takaItems.map((taka) => {
                                const isAssigned = !!taka.productionInfo?.millOutvertDate;
                                return (
                                  <CommandItem
                                    key={taka.id}
                                    value={taka.takaSrNo}
                                    onSelect={() => {
                                      if (isAssigned) {
                                        toast.error(
                                          `Taka No: ${taka.takaSrNo} has already been assigned to a mill outvert (Challan: ${taka.productionInfo?.firmChallanNo || "N/A"}).`
                                        );
                                        return;
                                      }
                                      toggleTaka(taka.takaSrNo);
                                    }}
                                    className={cn(
                                      isAssigned && "opacity-50 cursor-not-allowed select-none",
                                    )}
                                  >
                                    <Checkbox
                                      checked={currentValue.includes(
                                        taka.takaSrNo,
                                      )}
                                      disabled={isAssigned}
                                      className="mr-2"
                                      tabIndex={-1}
                                    />
                                    <span className="flex-1">{taka.takaSrNo}</span>
                                    {isAssigned && (
                                      <span className="text-xs text-muted-foreground italic">
                                        (Assigned in Challan: {taka.productionInfo?.firmChallanNo || "N/A"})
                                      </span>
                                    )}
                                  </CommandItem>
                                );
                              })
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {currentValue.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentValue.map((srNo) => (
                        <Badge
                          key={srNo}
                          variant="secondary"
                          className="gap-1"
                        >
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
        ),
      },
    ],
    [
      form,
      firmOptions,
      firmsLoading,
      firmPopoverOpen,
      millOptions,
      millsLoading,
      selectedFirmId,
      takaPopoverOpen,
      takasLoading,
      takaItems,
    ],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OrderedFields
          formId="mill-outvert-form"
          fields={fields}
          gridCols={2}
        />

        <SubmitButton isLoading={isLoading}>
          {defaultValues ? "Save Changes" : "Create Mill Outvert"}
        </SubmitButton>
      </form>
    </Form>
  );
}
