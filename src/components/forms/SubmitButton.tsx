"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = {
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  isLoading,
  children,
  className,
  disabled,
}: Props) {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className={cn(className)}
    >
      {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  );
}
