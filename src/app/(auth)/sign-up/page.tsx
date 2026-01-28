"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDUSTRIES = [
  "Apparel",
  "Beauty",
  "Consumer Electronics",
  "Home Goods",
  "Outdoor",
  "Other",
] as const;

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <Card className="w-full bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Create your partner profile</CardTitle>
            <CardDescription>
              Inspired by Capacity-style referral forms. This is a mock flow for now — submitting goes
              straight to the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/dashboard");
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Alex Morgan" autoComplete="name" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Company, Inc." required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://company.com" inputMode="url" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourname"
                  inputMode="url"
                />
              </div>

              <div className="grid gap-2">
                <Label>Industry</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
                  ← Back
                </Link>
                <Button type="submit" className="sm:w-auto">
                  Create account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

