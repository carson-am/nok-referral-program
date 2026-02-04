import { Presentation, FileText, ExternalLink, Download } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Marketing Materials
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to share Nok with confidence — messaging, assets, and resources at
          your fingertips.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nok Short Form Deck Card */}
        <Card className="bg-card/50 transition-all hover:scale-[1.02] hover:border-primary/30">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <Presentation className="size-8 text-primary" />
              <Badge variant="default">Overview Deck</Badge>
            </div>
            <CardTitle>Nok Short Form Deck</CardTitle>
            <CardDescription>
              A concise overview of Nok&apos;s value proposition, ideal for initial outreach or
              high-level introductions to prospective brands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="ghost" asChild className="flex-1">
                <Link
                  href="/nok-partnership-deck_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
                  View
                </Link>
              </Button>
              <Button variant="default" asChild className="flex-1">
                <Link href="/nok-partnership-deck_2026.pdf" download>
                  <Download className="size-4" />
                  Download
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nok's ICP Card */}
        <Card className="bg-card/50 transition-all hover:scale-[1.02] hover:border-primary/30">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <FileText className="size-8 text-primary" />
              <Badge variant="default">Strategy</Badge>
            </div>
            <CardTitle>Nok&apos;s ICP (Ideal Customer Profile)</CardTitle>
            <CardDescription>
              Understand our target market. This guide outlines the specific industries, volume
              requirements, and pain points that make a lead a perfect fit for Nok.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="ghost" asChild className="flex-1">
                <Link href="/nok-ICP.pdf" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  View
                </Link>
              </Button>
              <Button variant="default" asChild className="flex-1">
                <Link href="/nok-ICP.pdf" download>
                  <Download className="size-4" />
                  Download
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

