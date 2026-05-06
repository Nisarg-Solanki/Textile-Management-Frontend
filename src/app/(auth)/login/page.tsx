"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { loginAction } from "@/lib/actions/auth.actions";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES } from "@/lib/routes";
import { Form } from "@/components/ui/form";
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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const result = await loginAction(values.email, values.password);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setAuth(result.user, result.accessToken, result.permissions);
    router.push(ROUTES.DASHBOARD);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <InputField
              name="password"
              control={form.control}
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <div className="text-right">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <SubmitButton
              isLoading={form.formState.isSubmitting}
              className="w-full"
            >
              Sign In
            </SubmitButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="text-foreground underline underline-offset-4"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
