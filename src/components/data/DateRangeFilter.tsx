"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/forms/DatePickerField";

type DatePreset =
  | "all"
  | "yesterday"
  | "last_7_days"
  | "last_week"
  | "this_month"
  | "custom";

function computeRange(preset: DatePreset): {
  from: string | undefined;
  to: string | undefined;
} {
  const now = new Date();
  switch (preset) {
    case "yesterday": {
      const d = subDays(now, 1);
      return {
        from: startOfDay(d).toISOString(),
        to: endOfDay(d).toISOString(),
      };
    }
    case "last_7_days":
      return {
        from: startOfDay(subDays(now, 6)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case "last_week": {
      const lastWeek = subDays(now, 7);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 }).toISOString(),
      };
    }
    case "this_month":
      return {
        from: startOfMonth(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    default:
      return { from: undefined, to: undefined };
  }
}

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preset = (searchParams.get("date_preset") ?? "all") as DatePreset;
  const date_from = searchParams.get("date_from") ?? undefined;
  const date_to = searchParams.get("date_to") ?? undefined;

  function push(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v != null) params.set(k, v);
      else params.delete(k);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function handlePresetChange(value: string) {
    const p = value as DatePreset;
    if (p === "all") {
      push({ date_preset: undefined, date_from: undefined, date_to: undefined });
    } else if (p === "custom") {
      push({ date_preset: "custom", date_from: undefined, date_to: undefined });
    } else {
      const { from, to } = computeRange(p);
      push({ date_preset: p, date_from: from, date_to: to });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Date</span>
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_week">Last Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preset === "custom" && (
        <>
          <DatePickerField
            value={date_from ? new Date(date_from) : undefined}
            onChange={(date) => push({ date_from: date?.toISOString() })}
            placeholder="From date"
          />
          <DatePickerField
            value={date_to ? new Date(date_to) : undefined}
            onChange={(date) => push({ date_to: date?.toISOString() })}
            placeholder="To date"
          />
        </>
      )}
    </div>
  );
}
