"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserCheck, UserX } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { approveUser, rejectUser } from "@/lib/api/auth";
import { showErrorToast } from "@/lib/utils/handleError";
import { formatDate } from "@/lib/utils/formatDate";
import type { AuthUser } from "@/types/app";

type Props = {
  user: AuthUser;
};

export function PendingUserCard({ user }: Props) {
  const queryClient = useQueryClient();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  async function handleApprove(): Promise<void> {
    setApproveLoading(true);
    try {
      await approveUser(user.id);
      toast.success("User approved");
      await queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      setApproveOpen(false);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setApproveLoading(false);
    }
  }

  async function handleReject(): Promise<void> {
    setRejectLoading(true);
    try {
      await rejectUser(user.id);
      toast.success("User rejected");
      await queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      setRejectOpen(false);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setRejectLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="px-5 py-4 space-y-0.5">
          <p className="font-semibold text-base leading-tight">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground pt-0.5">
            Registered {formatDate(user.createdAt)}
          </p>
        </CardHeader>
        <CardFooter className="px-5 pb-4 flex items-center justify-end gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setApproveOpen(true)}
            disabled={approveLoading || rejectLoading}
          >
            <UserCheck className="mr-1.5 size-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={approveLoading || rejectLoading}
          >
            <UserX className="mr-1.5 size-4" />
            Reject
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve user?"
        description={`${user.name} (${user.email}) will be granted access to the system.`}
        confirmLabel="Approve"
        variant="default"
        onConfirm={handleApprove}
        isLoading={approveLoading}
      />

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject and remove user?"
        description={`${user.name}'s registration request will be permanently removed.`}
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={handleReject}
        isLoading={rejectLoading}
      />
    </>
  );
}
