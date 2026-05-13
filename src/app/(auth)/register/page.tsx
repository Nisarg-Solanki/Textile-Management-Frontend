"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth.schema";
import { register as registerUser } from "@/lib/api/auth";
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

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await registerUser(values.name, values.email, values.password);
      setSubmitted(true);
    } catch (err) {
      showErrorToast(err);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Register to request access to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertTitle>Registration Submitted</AlertTitle>
            <AlertDescription>
              Your account is pending approval by an administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                name="name"
                control={form.control}
                label="Full Name"
                placeholder="Jane Smith"
                required
              />
              <InputField
                name="email"
                control={form.control}
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <InputField
                name="password"
                control={form.control}
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                required
              />
              <SubmitButton
                isLoading={form.formState.isSubmitting}
                className="w-full"
              >
                Create Account
              </SubmitButton>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
