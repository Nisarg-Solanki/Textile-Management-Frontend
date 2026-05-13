"use client";

import { useQuery } from "@tanstack/react-query";
import { UserCheck } from "lucide-react";
import { SuperAdminGate } from "@/components/modules/SuperAdminGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/data/EmptyState";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingUserCard } from "@/components/modules/auth/PendingUserCard";
import { getPendingUsers } from "@/lib/api/auth";

function PendingUserCardSkeleton() {
  return (
    <Card>
      <CardHeader className="px-5 py-4 space-y-0.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52 mt-1" />
        <Skeleton className="h-3 w-28 mt-1" />
      </CardHeader>
      <CardFooter className="px-5 pb-4 flex justify-end gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
}

export default function PendingUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-users"],
    queryFn: getPendingUsers,
  });

  const users = data?.data ?? [];

  return (
    <SuperAdminGate>
      <PageHeader title="Pending Users" />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PendingUserCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <EmptyState
          title="No pending users"
          description="All registration requests have been reviewed."
          icon={UserCheck}
        />
      )}

      {!isLoading && users.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <PendingUserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </SuperAdminGate>
  );
}
