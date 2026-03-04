/** Agreement body with placeholders [NAME] and [Referral Partner NAME] for sign-up flow. Final Nok Referral Agreement. */
export const REFERRAL_AGREEMENT_TEMPLATE = `REFERRAL AGREEMENT (FINAL)
This Referral Agreement is entered into by and between Nokking Inc. ("Nok") and [Referral Partner NAME] ("Referral Partner").

Selected Definitions.
1.2. "Services" means Nok's Returns Management and Resale offerings.
1.4. "Qualifying Agreement" means any definitive agreement Nok enters into with Registered Leads. Referral rewards are triggered once the referred partner signs a contract with Nok.
1.5. "Registered Leads" means each proposed lead provided by Referral Partner and approved by Nok.

Services and Compensation.
2.1. Services. Referral Partner shall use commercially reasonable efforts to identify and introduce potential brands for Nok Services and Excess Inventory transactions.
2.2. Compensation. Referral Partner's sole compensation is defined under Exhibit A.

Lead Approval.
3.1. Approval. Referral Partner shall submit each lead to Nok. Nok has sole discretion to approve or withhold approval based on existing relationships.

Legal Relationship.
The relationship is that of independent contractors. Referral Partner is not an employee or agent of Nok.

Confidentiality.
Each party agrees to use Confidential Information only as necessary to exercise its rights under this Agreement and protect it with reasonable care.

Representations and Warranties.
Referral Partner will not make any unauthorized representations regarding Nok Services or engage in unfair or deceptive practices.

Limitation of Liability.
In no event shall either party be liable for lost profits. Aggregate liability is limited to commissions paid in the previous 12 months.

Term and Termination.
Initial term of two (2) years, auto-extending for one-year periods. Either party may terminate with 30 days' notice.

Governing Law.
This Agreement shall be governed by the laws of the State of Texas. Any legal proceedings shall be brought in Travis County, Texas.

EXHIBIT A: COMPENSATION
Brand Introductions (Gross Profit Share): Deal 1: 10% | Deal 2: 7.5% | Deal 3+: 4%
Buyer Introductions (Revenue Share): Deal 1: 7.5% | Deal 2: 5% | Deal 3+: 3%
Platform Bonus: If an introduction results in a multi-service agreement, Referral Partner shall receive a one-time Platform Bonus of $5,000, payable after the referred partner signs a contract with Nok.

Referral Partner Representative: [NAME]`;

export function fillAgreementPlaceholders(
  fullName: string,
  companyName: string,
): string {
  return REFERRAL_AGREEMENT_TEMPLATE.replace(/\[NAME\]/g, fullName).replace(
    /\[Referral Partner NAME\]/g,
    companyName,
  );
}
