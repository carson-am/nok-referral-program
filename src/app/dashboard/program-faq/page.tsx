import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProgramFaqPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Program FAQ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick answers about eligibility, payouts, and how referrals are tracked.
        </p>
      </div>

      <div className="mx-auto max-w-[850px] space-y-12">
        {/* Section 1: General Process */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            General Process
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="general-1">
              <AccordionTrigger>How do I submit a new referral?</AccordionTrigger>
              <AccordionContent>
                Simply click the &quot;Refer a Partner&quot; button in the top navigation bar from any screen. Fill out the partner&apos;s basic contact information and our team will take it from there.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="general-2">
              <AccordionTrigger>What happens after I submit a lead?</AccordionTrigger>
              <AccordionContent>
                Our partnership team reviews the submission within 24–48 hours. If it&apos;s a fit, we&apos;ll reach out to the contact. You can track the real-time status of the lead in your &quot;Referral History&quot; tab.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="general-3">
              <AccordionTrigger>Can I edit a referral after I have submitted it?</AccordionTrigger>
              <AccordionContent>
                To maintain data integrity, referrals cannot be edited directly after submission. If you need to update contact information, please contact your Partnership Manager.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="general-4">
              <AccordionTrigger>Is there a limit to the number of partners I can refer?</AccordionTrigger>
              <AccordionContent>
                No. We encourage our partners to refer as many qualified leads as possible. There are no caps on submissions or potential earnings.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Section 2: Ideal Lead Profile */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Ideal Lead Profile
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="lead-1">
              <AccordionTrigger>What types of companies are the best fit for Nok?</AccordionTrigger>
              <AccordionContent>
                Nok specializes in circular supply chain solutions. Ideal referrals are brands, retailers, or manufacturers looking to optimize their returns process or manage overstock.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lead-2">
              <AccordionTrigger>Can I refer companies outside of the United States?</AccordionTrigger>
              <AccordionContent>
                Currently, Nok focuses on North American operations. Please contact support for specific international inquiries.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lead-3">
              <AccordionTrigger>What is the typical &quot;sweet spot&quot; for a Nok partner in terms of size?</AccordionTrigger>
              <AccordionContent>
                We drive the most value for mid-market to enterprise-level brands that process at least $10M in annual returns or overstock.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lead-4">
              <AccordionTrigger>Do I need to make a formal introduction, or just provide the contact info?</AccordionTrigger>
              <AccordionContent>
                While a &quot;warm intro&quot; via email increases the chance of conversion, it is not required. Providing the contact info through this portal is enough for our team to begin outreach.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Section 3: Rewards & Payouts */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Rewards & Payouts
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="rewards-1">
              <AccordionTrigger>How and when do I get paid for a successful referral?</AccordionTrigger>
              <AccordionContent>
                Referral rewards are triggered once the referred partner signs a contract and completes their first transaction. Payouts are processed monthly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rewards-2">
              <AccordionTrigger>What do the different status badges mean?</AccordionTrigger>
              <AccordionContent>
                Pending means the lead is under review; In Progress means we are in active talks; Converted means the deal is closed; and Inactive means the lead didn&apos;t move forward.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rewards-3">
              <AccordionTrigger>How long is my referral &quot;active&quot; for attribution purposes?</AccordionTrigger>
              <AccordionContent>
                Once you submit a lead, you have a 12-month attribution window. If the lead signs with Nok within a year of your submission, you will receive full credit.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rewards-4">
              <AccordionTrigger>Where can I view my lifetime earnings and upcoming payouts?</AccordionTrigger>
              <AccordionContent>
                You can view a high-level summary in the &quot;Referral History&quot; tab. Detailed financial reporting can be found in the &quot;Marketing Materials&quot; section.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
}
