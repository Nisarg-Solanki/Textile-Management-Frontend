import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
  backHref?: string;
  filter?: ReactNode;
};

export function PageHeader({ children, backHref, filter }: Props) {
  if (!children && !backHref && !filter) return <div className="mb-6" />;
  return (
    <div className="flex items-center gap-3 mb-6 min-w-0">
      {backHref && (
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href={backHref}>
            <ChevronLeft className="size-4" />
            <span className="sr-only">Go back</span>
          </Link>
        </Button>
      )}
      {filter && (
        <div className="flex-1 min-w-0 overflow-x-auto">{filter}</div>
      )}
      {children && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">{children}</div>
      )}
    </div>
  );
}
