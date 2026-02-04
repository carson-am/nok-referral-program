"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { PartnersTable } from "@/components/partners/PartnersTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PARTNERS } from "@/lib/mock/partners";

const REFERRAL_SUCCESS_KEY = "referralSuccess";

export default function CurrentPartnersPage() {
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const flag = sessionStorage.getItem(REFERRAL_SUCCESS_KEY);
    if (flag) {
      toast.success("Your response has been recorded.");
      sessionStorage.removeItem(REFERRAL_SUCCESS_KEY);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Current Partners
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A quick view of partners you’ve referred and their current status.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Partner Directory</CardTitle>
          <CardDescription>
            Status badges reflect where each partner is in the program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartnersTable data={MOCK_PARTNERS} />
        </CardContent>
      </Card>
    </div>
  );
}

