"use client";

import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils/cn";

type Option = {
  value: string;
  label: string;
};

type Props<TFieldValues extends FieldValues = FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  placeholder?: string;
  options: Option[];
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  onAddNew?: () => void;
};

export function SelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder = "Select an option",
  options,
  isLoading,
  disabled,
  required,
  description,
  onAddNew,
}: Props<TFieldValues>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedLabel = options.find((o) => o.value === field.value)?.label;

        return (
          <FormItem>
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={disabled}
                      className={cn(
                        "w-full justify-between font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {selectedLabel ?? placeholder}
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      {!isLoading && (
                        <CommandEmpty>No results found.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {isLoading ? (
                          <>
                            <div className="px-2 py-1.5">
                              <Skeleton className="h-6 w-full" />
                            </div>
                            <div className="px-2 py-1.5">
                              <Skeleton className="h-6 w-full" />
                            </div>
                            <div className="px-2 py-1.5">
                              <Skeleton className="h-6 w-full" />
                            </div>
                          </>
                        ) : (
                          options.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => {
                                field.onChange(option.value);
                                setOpen(false);
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

              {onAddNew && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={disabled}
                  onClick={onAddNew}
                >
                  <Plus className="size-4" />
                </Button>
              )}
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
