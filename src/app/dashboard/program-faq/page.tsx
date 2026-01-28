import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgramFaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Program FAQ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick answers about eligibility, payouts, and how referrals are tracked.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This section will host a polished, searchable FAQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder content for now.
        </CardContent>
      </Card>
    </div>
  );
}

