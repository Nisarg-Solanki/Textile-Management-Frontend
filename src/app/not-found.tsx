import Link from "next/link";
import { Home, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <div className="relative mb-8 select-none">
          <span className="text-[9rem] font-black leading-none tracking-tighter text-muted/40 dark:text-muted/20">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/20">
              <Unplug className="size-12 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Head back home to get back on track.
        </p>

        <Button asChild size="lg" className="gap-2">
          <Link href={ROUTES.HOME}>
            <Home className="size-4" />
            Go to Home
          </Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-muted-foreground/60 tracking-wide">
        Textile Management System
      </p>
    </div>
  );
}
