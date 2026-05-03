"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES } from "@/lib/routes";

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, clear } = useAuthStore();

  const segments = pathname.split("/").filter(Boolean);

  function handleLogout() {
    clear();
    router.push(ROUTES.LOGIN);
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";
  const roleLabel = user?.role === "super_admin" ? "Super Admin" : "Admin";

  return (
    <header className="flex flex-row items-center justify-between border-b px-6 h-14">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            const label = formatSegment(segment);

            return (
              <Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {resolvedTheme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-9 rounded-full p-0">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled>
              <span className="font-medium">{user?.name}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Badge variant="secondary" className="text-xs">
                {roleLabel}
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
