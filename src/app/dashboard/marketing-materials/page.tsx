import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Marketing Materials
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share consistent messaging and assets with prospective partners.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This section will include downloadable decks, one-pagers, and copy blocks.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder content for now.
        </CardContent>
      </Card>
    </div>
  );
}

