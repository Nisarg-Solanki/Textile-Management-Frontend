"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { refreshSession } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES } from "@/lib/routes";

function DashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex flex-col border-r bg-card md:w-16 lg:w-64 shrink-0">
        <div className="h-14 border-b px-4 flex items-center">
          <Skeleton className="h-5 w-24 hidden lg:block" />
          <Skeleton className="h-5 w-5 lg:hidden" />
        </div>
        <div className="p-3 flex flex-col gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-14 border-b px-6 flex items-center justify-between shrink-0">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-52 w-full rounded-lg mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const { user, setAuth } = useAuthStore.getState();

    if (user) {
      setIsHydrating(false);
      return;
    }

    refreshSession()
      .then((session) => {
        if (cancelled) return;
        setAuth(session.user, session.accessToken, session.permissions);
        setIsHydrating(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsHydrating(false);
        router.push(ROUTES.LOGIN);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isHydrating) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
