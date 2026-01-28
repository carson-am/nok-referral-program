import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReferralHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Referral History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track referrals over time and see key milestones.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This section will show a timeline of referrals and outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder content for now.
        </CardContent>
      </Card>
    </div>
  );
}

