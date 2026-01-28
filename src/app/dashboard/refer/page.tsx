"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ReferPartnerPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Refer a Partner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit partner details. This is a mock flow for now — we’ll route you back to Current
          Partners after submit.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Partner details</CardTitle>
          <CardDescription>Keep it concise and accurate — Nok will follow up.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/dashboard/current-partners");
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Jordan Lee" autoComplete="name" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Company, Inc." required />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jordan@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="relationship">Relationship to Partner</Label>
              <Textarea
                id="relationship"
                placeholder="How do you know this partner? Any context that helps Nok follow up."
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Submit referral</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

