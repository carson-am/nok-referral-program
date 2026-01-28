"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_35%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 md:grid-cols-2 md:gap-16">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
              <span className="font-semibold tracking-wide text-foreground">nok</span>
              <span className="h-3 w-px bg-border/70" />
              Referral Partner Tool
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Refer partners. Track outcomes. Keep it simple.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              A premium, modern portal for Nok referral partners — designed with plenty of whitespace,
              subtle depth, and Nok-blue interactions.
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Mock authentication for now — your button click takes you straight to the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Sign In
                <ArrowRight />
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Sign Up
              </Button>
              <p className="pt-2 text-center text-sm text-muted-foreground">
                Prefer the full sign-up form?{" "}
                <Link className="text-primary hover:underline" href="/sign-up">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

