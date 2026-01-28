import { PartnersTable } from "@/components/partners/PartnersTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PARTNERS } from "@/lib/mock/partners";

export default function CurrentPartnersPage() {
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

