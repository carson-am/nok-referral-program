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
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { fillAgreementPlaceholders } from "@/lib/referral-agreement-text";

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
  const [step, setStep] = useState<1 | 2>(1);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
    mode: "onChange",
  });

  const fullName = form.watch("fullName");
  const canCreateAccount =
    agreementAccepted &&
    digitalSignature.trim().toLowerCase() === fullName.trim().toLowerCase();

  function handleContinueToAgreement() {
    form.handleSubmit(
      () => setStep(2),
      () => {},
    )();
  }

  async function handleCreateAccount() {
    if (!isLoaded || !signUp || !canCreateAccount) return;
    const values = form.getValues();
    setIsCreating(true);
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
      const rawMessage =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors: { message: string; code?: string }[] }).errors?.[0]?.message ?? ""
          : "";
      const isPwnedOrCompromised =
        typeof rawMessage === "string" &&
        /pwned|compromised|data breach|breach|password has been found/i.test(rawMessage);
      const message = isPwnedOrCompromised
        ? "This password does not meet our security standards. Please choose a different password."
        : rawMessage || "Could not create account. Please try again.";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp || !setActive || !verificationCode.trim()) return;
    setIsVerifying(true);
    const values = form.getValues();
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });
      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: () => {},
        });
        const res = await fetch("/api/save-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: values.fullName.trim(),
            company_name: values.companyName.trim(),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error || "Could not save agreement.");
        }
        toast.success("Account created successfully! Welcome to Nok.");
        setVerificationOpen(false);
        setVerificationCode("");
        router.push("/dashboard/referral-history");
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

  const agreementText = fillAgreementPlaceholders(
    form.watch("fullName") || "",
    form.watch("companyName") || "",
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <Card className="w-full rounded-xl bg-card/80 shadow-[0_0_40px_rgba(45,107,255,0.15)] backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle>Create Your Profile</CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your details to get started with your account."
                : "Review and accept the Referral Agreement to complete registration."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <Form {...form}>
                <form className="grid gap-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input className="rounded-xl" autoComplete="name" {...field} />
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
                          <Input className="rounded-xl" type="email" autoComplete="email" {...field} />
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
                          <Input className="rounded-xl" type="password" autoComplete="new-password" {...field} />
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
                          <Input className="rounded-xl" type="password" autoComplete="new-password" {...field} />
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
                          <Input className="rounded-xl" {...field} />
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
                      type="button"
                      className="rounded-xl sm:w-auto"
                      disabled={!form.formState.isValid}
                      onClick={handleContinueToAgreement}
                    >
                      Continue to Agreement
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-5">
                <div>
                  <a
                    href="/referral-agreement.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Download PDF
                  </a>
                </div>
                <ScrollArea className="h-[300px] w-full rounded-xl border border-border/70 bg-muted/20 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {agreementText}
                  </pre>
                </ScrollArea>
                <p className="text-xs italic text-muted-foreground">
                  Note: This is our standard Referral Agreement used for all partners to ensure program
                  simplicity and operational speed. These terms are non-negotiable.
                </p>
                <div className="flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/70 bg-muted/20 p-4">
                  <Checkbox
                    id="agreement"
                    checked={agreementAccepted}
                    onCheckedChange={(checked) => setAgreementAccepted(checked === true)}
                    className="rounded"
                  />
                  <label
                    htmlFor="agreement"
                    className="cursor-pointer text-sm font-normal leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the terms and conditions of the Nok Referral Agreement.
                  </label>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="digital-signature" className="text-sm font-medium text-foreground">
                    Digital Signature
                  </label>
                  <Input
                    id="digital-signature"
                    className="rounded-xl"
                    placeholder="Type your full name to sign"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    Back to Information
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl sm:w-auto"
                    disabled={!canCreateAccount || isCreating}
                    onClick={handleCreateAccount}
                  >
                    {isCreating ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
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
