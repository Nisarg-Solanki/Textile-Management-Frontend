"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import type { ColumnDef } from "@tanstack/react-table";
import { Shield, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data/DataTable";
import { EmptyState } from "@/components/data/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { getUsers, deleteUser } from "@/lib/api/auth";
import { ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils/formatDate";
import { showErrorToast } from "@/lib/utils/handleError";
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
  const queryClient = useQueryClient();

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items: users, totalCount, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteList<AuthUser, Record<string, never>>({
      queryKey: ["users"],
      params: {},
      limit: LIMIT,
      fetcher: getUsers,
    });

  const deletingUser = useMemo(
    () => users.find((u) => u.id === deletingUserId) ?? null,
    [users, deletingUserId],
  );

  async function handleDelete() {
    if (!deletingUserId) return;
    setIsDeleting(true);
    try {
      await deleteUser(deletingUserId);
      toast.success("User deleted successfully");
      setDeletingUserId(null);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsDeleting(false);
    }
  }

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
        cell: ({ row }) => {
          const isSuperAdmin = row.original.role === "super_admin";
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={isSuperAdmin}
                onClick={() =>
                  router.push(ROUTES.ADMIN.PERMISSIONS(row.original.id))
                }
              >
                <Shield className="mr-1.5 size-4" />
                Permissions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isSuperAdmin}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeletingUserId(row.original.id)}
              >
                <Trash2 className="mr-1.5 size-4" />
                Delete
              </Button>
            </div>
          );
        },
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
          tableId="users"
          onRefresh={refetch}
          columns={columns}
          data={users}
          isLoading={isLoading}
          infiniteScroll={{
            hasNextPage,
            isFetchingNextPage,
            fetchNextPage,
            totalCount,
          }}
        />
      )}

      <ConfirmDialog
        open={deletingUserId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUserId(null);
        }}
        title="Delete User"
        description={
          deletingUser
            ? `Are you sure you want to delete "${deletingUser.name}" (${deletingUser.email})? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </SuperAdminGate>
  );
}
