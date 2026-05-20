"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data/DataTable";
import { EmptyState } from "@/components/data/EmptyState";
import { getUsers } from "@/lib/api/auth";
import { ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils/formatDate";
import type { AuthUser } from "@/types/app";

const LIMIT = 20;

const ROLE_LABEL: Record<AuthUser["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

const STATUS_CLASS: Record<string, string> = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0",
  inactive: "",
};

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, limit: LIMIT }],
    queryFn: () => getUsers({ page, limit: LIMIT }),
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const columns = useMemo<ColumnDef<AuthUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
      },
      {
        accessorKey: "role",
        header: "Role",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.role === "super_admin" ? "default" : "secondary"
            }
          >
            {ROLE_LABEL[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant="outline"
              className={STATUS_CLASS[status] ?? ""}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        enableSorting: false,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(ROUTES.ADMIN.PERMISSIONS(row.original.id))
            }
          >
            <Shield className="mr-1.5 size-4" />
            Permissions
          </Button>
        ),
      },
    ],
    [router],
  );

  return (
    <SuperAdminGate>
      <PageHeader title="Users" />

      {!isLoading && users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="No users have registered yet."
          icon={Users}
        />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </SuperAdminGate>
  );
}
