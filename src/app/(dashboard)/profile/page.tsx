"use client";

import { useState } from "react";
import { KeyRound, Mail, ShieldCheck, User, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuthStore } from "@/lib/store/authStore";
import { forgotPassword } from "@/lib/api/auth";
import { showErrorToast } from "@/lib/utils/handleError";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ─── Reset Password Confirmation Dialog ────────────────────────────────────

function ResetPasswordDialog({
  open,
  onOpenChange,
  userEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}) {
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    setIsSending(true);
    try {
      await forgotPassword(userEmail);
      toast.success("Reset email sent!", {
        description: `A password reset link has been sent to ${userEmail}. Check your inbox.`,
      });
      onOpenChange(false);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1">
              <p>We will send a password reset link to:</p>
              <p className="font-medium text-foreground break-all">{userEmail}</p>
              <p>
                Follow the link in your email to choose a new password. The link
                expires in 1 hour.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending…" : "Send Reset Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Profile Page ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  if (!user) return null;

  const initials = user.name.charAt(0).toUpperCase();
  const roleLabel = user.role === "super_admin" ? "Super Admin" : "Admin";
  // const memberSince = user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy") : "—";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* ── User Info Card ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{user.name}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {roleLabel}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Detail rows */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
              <div className="flex items-center gap-3 shrink-0">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-28 shrink-0">
                  Full Name
                </span>
              </div>
              <span className="font-medium break-words max-w-full">{user.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
              <div className="flex items-center gap-3 shrink-0">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-28 shrink-0">Email</span>
              </div>
              <span className="font-medium break-all sm:break-words max-w-full">{user.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
              <div className="flex items-center gap-3 shrink-0">
                <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-28 shrink-0">Role</span>
              </div>
              <span className="font-medium break-words max-w-full">{roleLabel}</span>
            </div>

            {/* <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-28 shrink-0">Member Since</span>
              <span className="font-medium">{memberSince}</span>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* ── Security Card ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                Receive a secure reset link at your registered email address
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(true)}
              className="gap-2 shrink-0 w-full sm:w-auto"
            >
              <KeyRound className="size-4" />
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResetPasswordDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        userEmail={user.email}
      />
    </div>
  );
}
