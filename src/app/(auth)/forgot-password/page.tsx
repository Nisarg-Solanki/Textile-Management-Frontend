"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/schemas/auth.schema";
import { forgotPassword } from "@/lib/api/auth";
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

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      await forgotPassword(values.email);
    } catch {
      // deliberately silenced — never reveal whether the email exists
    }
    setSubmitted(true);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <Alert>
            <MailCheck className="size-4" />
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              If an account exists for this email, a reset link has been sent.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                name="email"
                control={form.control}
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <SubmitButton
                isLoading={form.formState.isSubmitting}
                className="w-full"
              >
                Send Reset Link
              </SubmitButton>
            </form>
          </Form>
        )}
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
