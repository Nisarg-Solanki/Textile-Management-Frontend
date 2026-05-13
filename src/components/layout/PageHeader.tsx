import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children?: ReactNode;
  backHref?: string;
};

export function PageHeader({ title, children, backHref }: Props) {
  return (
    <div className="flex flex-row items-center justify-between border-b pb-4 mb-6">
      <div className="flex items-center gap-2">
        {backHref && (
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ChevronLeft className="size-4" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
