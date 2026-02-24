"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

const referSchema = z.object({
  fullName: z.string().min(1, "This field is required."),
  jobTitle: z.string().min(1, "This field is required."),
  companyName: z.string().min(1, "This field is required."),
  companyWebsite: z.string().min(1, "This field is required."),
  email: z.string().min(1, "This field is required.").email("Invalid email address."),
  phone: z.string().min(1, "This field is required."),
  relationship: z.string().min(1, "This field is required."),
});

type ReferValues = z.infer<typeof referSchema>;

const defaultValues: ReferValues = {
  fullName: "",
  jobTitle: "",
  companyName: "",
  companyWebsite: "",
  email: "",
  phone: "",
  relationship: "",
};

const REFERRAL_SUCCESS_KEY = "referralSuccess";

export default function ReferPartnerPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const form = useForm<ReferValues>({
    resolver: zodResolver(referSchema),
    defaultValues,
  });

  async function onSubmit(values: ReferValues) {
    if (!userId) {
      toast.error("You must be signed in to submit a referral.");
      return;
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error("Database is not configured. Please try again later.");
      return;
    }
    const { error } = await supabase.from("referrals").insert({
      user_id: userId,
      full_name: values.fullName.trim(),
      job_title: values.jobTitle.trim(),
      company_name: values.companyName.trim(),
      company_website: values.companyWebsite.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      relationship: values.relationship.trim(),
      status: "submitted",
    });
    if (error) {
      toast.error(error.message || "Failed to save referral. Please try again.");
      return;
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(REFERRAL_SUCCESS_KEY, "1");
    }
    router.push("/dashboard/current-partners");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Refer a Partner
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your referral and we&apos;ll take it from here. You&apos;ll be redirected back to the Nok Pipeline while we review the details.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Partner details</CardTitle>
          <CardDescription>
            Share what you know — we&apos;ll handle the rest and follow up from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2 sm:gap-5">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Partner&apos;s Job Title <span className="text-destructive">*</span>
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
                  name="companyWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company Website <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="url" inputMode="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="grid gap-5 sm:grid-cols-2 sm:gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Business Email <span className="text-destructive">*</span>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Relationship to Partner <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit referral"}
              </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
