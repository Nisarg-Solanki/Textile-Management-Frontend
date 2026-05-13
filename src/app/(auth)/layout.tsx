import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/routes";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  if (cookieStore.has("refreshToken")) {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      {children}
    </div>
  );
}
