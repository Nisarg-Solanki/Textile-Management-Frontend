"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

// Stable DOM id forms portal their "Order" (field reorder) button into.
// See OrderedFields — it looks this slot up on mount and renders into it.
export const HEADER_ACTIONS_SLOT_ID = "page-header-actions-slot";

type Props = {
  title?: string;
  children?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  filter?: ReactNode;
};

export function PageHeader({ children, backHref, onBack, filter }: Props) {
  const backButton = onBack ? (
    <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
      <ChevronLeft className="size-4" />
      <span className="sr-only">Go back</span>
    </Button>
  ) : backHref ? (
    <Button variant="ghost" size="icon" className="shrink-0" asChild>
      <Link href={backHref}>
        <ChevronLeft className="size-4" />
        <span className="sr-only">Go back</span>
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex items-center gap-3 mb-6 min-w-0">
      {backButton}
      {filter && (
        <div className="flex-1 min-w-0 overflow-x-auto">{filter}</div>
      )}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {children}
        <div
          id={HEADER_ACTIONS_SLOT_ID}
          className="flex items-center gap-2"
        />
      </div>
    </div>
  );
}
