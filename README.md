# PropScope — Stage 1 (Frontend)

Automated real estate investment analysis platform. This is **Stage 1: the public marketing website + client portal frontend**, built with React, Vite, Tailwind CSS, and React Router.

Auth and data are **mocked** in this stage so the entire app is clickable. Real auth, the Claude-powered report engine, Stripe payments, PDF delivery, and the admin dashboard come in later stages.

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

## Try it out

- Browse the marketing site: **Home, Features, How it works, Pricing, FAQ, About, Contact**.
- Click **Get started** or **Log in** — in demo mode **any email/password works**.
- You land in the **portal**: Dashboard → New analysis (4-step intake form) → Reports → open a report → Account → Billing.

## Pricing tiers (in `src/lib/plans.js`)

| Tier | Price | What it is |
|------|-------|------------|
| Deal Check | $97 | Basic go/no-go snapshot |
| Deal Analyzer | $297 | Full investment report |
| Deal Intelligence | $597 | Full report + BRRRR + executive memo |
| Investor Pro | $497/mo | Unlimited reports |

## Project structure

```
src/
  components/
    ui/            Reusable primitives (Logo, Section, Stat, ScoreRing)
    marketing/     Navbar, Footer, layout, pricing cards, auth shell
    portal/        Portal layout/sidebar, page header, report card
  context/         AuthContext (mocked auth)
  lib/             plans, format helpers, mock data
  pages/
    marketing/     Home, Features, HowItWorks, Pricing, Faq, About, Contact, NotFound
    auth/          Login, Signup, ForgotPassword
    portal/        Dashboard, NewDeal, Reports, ReportDetail, Account, Billing
  App.jsx          Routes (public + protected)
  main.jsx         Entry
```

## Routes

- Public: `/`, `/features`, `/how-it-works`, `/pricing`, `/faq`, `/about`, `/contact`
- Auth: `/login`, `/signup`, `/forgot-password`
- Portal (protected): `/app`, `/app/new`, `/app/reports`, `/app/reports/:id`, `/app/account`, `/app/billing`

## What's next (later stages)

1. **Backend + real auth** — replace `AuthContext` mock with a real provider; protected API.
2. **AI report engine** — Claude API pipeline behind the intake form.
3. **Stripe** — wire the pricing/billing pages to real checkout + webhooks.
4. **PDF delivery** — generate and email the report PDFs.
5. **Admin dashboard** — users, reports, and revenue management.

---
Reports are illustrative estimates for informational purposes only — not financial advice.
