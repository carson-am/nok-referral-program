"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
              <CardHeader>
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>
                  Provide your credentials to access the Nok Referral Partner dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    router.push("/dashboard");
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign In
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
    </div>
  );
}

