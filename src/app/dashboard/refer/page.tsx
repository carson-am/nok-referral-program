"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

const introduceSchema = z.object({
  fullName: z.string().min(1, "This field is required."),
  companyName: z.string().min(1, "This field is required."),
  email: z.string().min(1, "This field is required.").email("Invalid email address."),
  warmIntroConfirmed: z
    .boolean()
    .refine((val) => val === true, "You must confirm you have sent the warm introduction."),
});

type IntroduceValues = z.infer<typeof introduceSchema>;

const defaultValues: IntroduceValues = {
  fullName: "",
  companyName: "",
  email: "",
  warmIntroConfirmed: false,
};

const REFERRAL_SUCCESS_KEY = "referralSuccess";

export default function IntroducePartnerPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const form = useForm<IntroduceValues>({
    resolver: zodResolver(introduceSchema),
    defaultValues,
  });

  const warmIntroConfirmed = form.watch("warmIntroConfirmed");

  async function onSubmit(values: IntroduceValues) {
    if (!userId) {
      toast.error("You must be signed in to submit an introduction.");
      return;
    }

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          companyName: values.companyName.trim(),
          email: values.email.trim(),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(
          data?.error || "Failed to save introduction. Please try again."
        );
        return;
      }

      toast.success("Introduction logged. Maddy will look out for the email thread!");
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(REFERRAL_SUCCESS_KEY, "1");
      }
      router.push("/dashboard/referral-history");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save introduction. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Introduce a Partner
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your referral and send your warm introduction. You&apos;ll be redirected back to your Personal Dashboard after submission.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Introduction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
              <Button type="button" variant="default" asChild className="w-full sm:w-auto">
                <a href="/nok-introduction-email-templates.docx" download>
                  <Download className="size-4" />
                  Need A Template?
                </a>
              </Button>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Partner Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Partner Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warmIntroConfirmed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/70 bg-muted/20 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-describedby="warm-intro-description"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel
                        id="warm-intro-description"
                        className="cursor-pointer text-sm font-normal text-foreground"
                        onClick={() => field.onChange(!field.value)}
                      >
                        I have sent a warm introduction email to this partner and CC&apos;d Maddy (maddy@nokrecommerce.com).
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !warmIntroConfirmed}
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Introduction"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
