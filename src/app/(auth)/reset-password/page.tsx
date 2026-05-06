"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth.schema";
import { resetPassword } from "@/lib/api/auth";
import { showErrorToast } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputField } from "@/components/forms/InputField";
import { SubmitButton } from "@/components/forms/SubmitButton";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) return;
    try {
      await resetPassword(token, values.password);
      toast.success("Password reset successfully");
      router.push(ROUTES.LOGIN);
    } catch (err) {
      showErrorToast(err);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Invalid Reset Link</AlertTitle>
            <AlertDescription>
              This reset link is invalid or has expired.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Request a new reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter and confirm your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="password"
              control={form.control}
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              required
            />
            <InputField
              name="confirmPassword"
              control={form.control}
              label="Confirm Password"
              type="password"
              placeholder="Repeat new password"
              required
            />
            <SubmitButton
              isLoading={form.formState.isSubmitting}
              className="w-full"
            >
              Reset Password
            </SubmitButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href={ROUTES.LOGIN}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="h-32" />
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
