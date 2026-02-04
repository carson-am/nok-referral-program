"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  const form = useForm<ReferValues>({
    resolver: zodResolver(referSchema),
    defaultValues,
  });

  function onSubmit() {
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
          Submit your referral and we&apos;ll take it from here. You&apos;ll be redirected back to
          Current Partners while we review the details.
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
                <Button type="submit">Submit referral</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
