## Nok Referral Partner Tool

Referral Partner Tool for **Nok Recommerce** built with **Next.js App Router**, **Tailwind CSS**, and **shadcn/ui-style components** (with Lucide icons).

### Routes

- **`/`**: Mock Sign In (Sign In / Sign Up buttons redirect to the dashboard)
- **`/sign-up`**: Capacity-inspired sign-up form (submit redirects to the dashboard)
- **`/dashboard/*`**: App shell with sidebar + fixed top nav
  - **`/dashboard/referral-history`**: Personal Dashboard (referral stats, pipeline, recent activity, universal calendar)
  - **`/dashboard/meeting-archive`**: Meeting Archive (past meetings, recording links)
  - **`/dashboard/refer`**: “Introduce a Partner” form
  - Nok Materials, Program FAQ

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in values. For the **Events Board** (Meeting Archive and universal calendar), set:

| Variable | Purpose |
|----------|---------|
| `MONDAY_EVENTS_BOARD_ID` | Monday.com Events board ID (default: `18403201755`) |
| `MONDAY_EVENT_DATE_ID` | Date column ID on the board |
| `MONDAY_EVENT_DESC_ID` | Description column ID |
| `MONDAY_EVENT_REC_ID` | Recording URL column ID |
| `MONDAY_EVENT_LINK_ID` | Meeting link column ID |

Column IDs vary per board; obtain them from your Monday.com Events board.

### Notes

- **Branding/theme** lives in `src/app/globals.css` using a Nok RFP-inspired dark palette.
- **Radius** is standardized to \(0.75rem\) (`rounded-xl`) for cards and inputs.
