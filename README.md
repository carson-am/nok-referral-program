## Nok Referral Partner Tool

Referral Partner Tool for **Nok Recommerce** built with **Next.js App Router**, **Tailwind CSS**, and **shadcn/ui-style components** (with Lucide icons).

### Routes

- **`/`**: Mock Sign In (Sign In / Sign Up buttons redirect to the dashboard)
- **`/sign-up`**: Capacity-inspired sign-up form (submit redirects to the dashboard)
- **`/dashboard/*`**: App shell with sidebar + fixed top nav
  - **`/dashboard/current-partners`**: Data table with mock partners
  - **`/dashboard/refer`**: “Refer a Partner” form
  - Other tabs are placeholders for now

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Notes

- **Branding/theme** lives in `src/app/globals.css` using a Nok RFP-inspired dark palette.
- **Radius** is standardized to \(0.75rem\) (`rounded-xl`) for cards and inputs.
