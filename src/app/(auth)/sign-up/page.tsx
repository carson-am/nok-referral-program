"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const signUpSchema = z
  .object({
    fullName: z.string().min(1, "This field is required."),
    email: z.string().min(1, "This field is required.").email("Invalid email address."),
    password: z.string().min(8, "Must be at least 8 characters."),
    confirmPassword: z.string().min(1, "This field is required."),
    companyName: z.string().min(1, "This field is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

const defaultValues: SignUpValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
};

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
  });

  async function onSubmit(values: SignUpValues) {
    if (!isLoaded || !signUp) return;
    try {
      const nameParts = values.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] ?? values.fullName;
      const lastName = nameParts.slice(1).join(" ") ?? "";

      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName,
        lastName,
        unsafeMetadata: {
          companyName: values.companyName,
        },
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerificationOpen(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message
          : "Could not create account. Please try again.";
      toast.error(message);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp || !setActive || !verificationCode.trim()) return;
    setIsVerifying(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });
      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: () => router.push("/dashboard/referral-history"),
        });
        toast.success("Account created successfully! Welcome to Nok.");
        setVerificationOpen(false);
        setVerificationCode("");
      } else {
        toast.error("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message
          : "Invalid verification code.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <Card className="w-full bg-card/80 backdrop-blur shadow-[0_0_40px_rgba(45,107,255,0.15)]">
          <CardHeader className="text-center">
            <CardTitle>Create Your Profile</CardTitle>
            <CardDescription>
              Enter your details to get started with your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="grid gap-5"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormDescription>Must be at least 8 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Confirm Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
                    ← Back
                  </Link>
                  <Button
                    type="submit"
                    className="sm:w-auto"
                    disabled={!isLoaded || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
        <DialogContent showClose className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We sent a 6-digit verification code to your email. Enter it below to complete your
              account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyCode} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label htmlFor="verification-code" className="text-sm font-medium text-foreground">
                Verification code
              </label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-xl text-center text-lg tracking-[0.5em]"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? "Verifying..." : "Verify and continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
