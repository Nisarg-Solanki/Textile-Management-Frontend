"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
};

export function FirmFilter({ options }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firmId = searchParams.get("firmId");

  function handleSelect(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("firmId", value);
    } else {
      params.delete("firmId");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1 min-w-max">
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
            !firmId
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              firmId === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
