"use client";

import { usePermission } from "@/lib/hooks/usePermission";
import type { ReactNode } from "react";

type Props = {
  module: Parameters<typeof usePermission>[0];
  action: Parameters<typeof usePermission>[1];
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: Props) {
  const allowed = usePermission(module, action);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
