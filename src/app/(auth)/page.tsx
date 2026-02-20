"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function NokLogo() {
  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl font-bold tracking-tight text-white md:text-6xl">nok</span>
      <span className="text-sm font-bold tracking-wide text-[#E8863A] md:text-base">
        RECOMMERCE
      </span>
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [secondFactorCode, setSecondFactorCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn || !setActive) return;
    setIsSubmitting(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });
      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: () => router.push("/dashboard/current-partners"),
        });
        return;
      }
      if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (f) => f.strategy === "email_code"
        );
        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: (emailCodeFactor as { emailAddressId: string }).emailAddressId,
          });
          setShowEmailCode(true);
        } else {
          toast.error("Additional verification is required. Please try again.");
        }
      } else {
        toast.error("Sign-in could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "errors" in err
        ? (err as { errors: { message: string }[] }).errors?.[0]?.message
        : "Invalid email or password.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn || !setActive) return;
    setIsSubmitting(true);
    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: secondFactorCode,
      });
      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: () => router.push("/dashboard/current-partners"),
        });
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "errors" in err
        ? (err as { errors: { message: string }[] }).errors?.[0]?.message
        : "Invalid code.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendResetLink() {
    if (!isLoaded || !signIn || !resetEmail.trim()) return;
    setIsResetSubmitting(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: resetEmail.trim(),
      });
      setResetStep("code");
      toast.success("Reset link sent! Check your email for the code.");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "errors" in err
        ? (err as { errors: { message: string }[] }).errors?.[0]?.message
        : "Could not send reset code. Check the email address.";
      toast.error(message);
    } finally {
      setIsResetSubmitting(false);
    }
  }

  async function handleResetWithCode() {
    if (!isLoaded || !signIn || !setActive || !resetCode.trim() || !resetPassword.trim()) return;
    if (resetPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsResetSubmitting(true);
    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode.trim(),
        password: resetPassword,
      });
      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: () => router.push("/dashboard/current-partners"),
        });
        toast.success("Password reset successfully.");
        setForgotPasswordOpen(false);
        setResetStep("email");
        setResetCode("");
        setResetPassword("");
      } else {
        toast.error("Reset could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "errors" in err
        ? (err as { errors: { message: string }[] }).errors?.[0]?.message
        : "Invalid code or password.";
      toast.error(message);
    } finally {
      setIsResetSubmitting(false);
    }
  }

  function closeForgotModal(open: boolean) {
    if (!open) {
      setResetStep("email");
      setResetEmail("");
      setResetCode("");
      setResetPassword("");
    }
    setForgotPasswordOpen(open);
  }

  if (showEmailCode) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_35%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur shadow-[0_0_40px_rgba(45,107,255,0.15)]">
            <CardHeader className="text-center">
              <CardTitle>Verify your email</CardTitle>
              <CardDescription>
                A verification code has been sent to your email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailCodeSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={secondFactorCode}
                    onChange={(e) => setSecondFactorCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_35%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col items-center space-y-6">
            <NokLogo />
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Grow together. Shape the future of recommerce.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Join the leader in reverse supply chain solutions. Refer brands, track your progress,
                and unlock mutual growth.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-card/80 backdrop-blur shadow-[0_0_40px_rgba(45,107,255,0.15)]">
              <CardHeader className="text-center">
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>
                  Provide your credentials to access the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring/70 rounded"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Button type="submit" className="w-full rounded-xl" disabled={!isLoaded || isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <p className="pt-2 text-center text-sm text-muted-foreground">
                  First time here?{" "}
                  <Link className="text-primary hover:underline" href="/sign-up">
                    Create an account
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={closeForgotModal}>
        <DialogContent showClose className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetStep === "email"
                ? "Enter your email address and we'll send you a code to reset your password."
                : "Enter the 6-digit code from your email and choose a new password."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {resetStep === "email" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendResetLink}
                  className="w-full rounded-xl"
                  disabled={isResetSubmitting}
                >
                  {isResetSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="reset-code">Verification code</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reset-new-password">New password</Label>
                  <Input
                    id="reset-new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleResetWithCode}
                  className="w-full rounded-xl"
                  disabled={isResetSubmitting || !resetCode.trim() || resetPassword.length < 8}
                >
                  {isResetSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => closeForgotModal(false)}
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring/70 rounded text-center"
            >
              Back to Sign In
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
