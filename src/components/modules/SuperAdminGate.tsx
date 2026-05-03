"use client";

import { useIsSuperAdmin } from "@/lib/hooks/usePermission";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function SuperAdminGate({ children, fallback = null }: Props) {
  const isSuperAdmin = useIsSuperAdmin();
  return isSuperAdmin ? <>{children}</> : <>{fallback}</>;
}
