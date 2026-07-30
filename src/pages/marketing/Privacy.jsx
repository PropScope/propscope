import { Section } from '../../components/ui/Section.jsx'

const EFFECTIVE = 'July 30, 2026'

export default function Privacy() {
  return (
    <Section className="pt-14">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-400">Last updated: {EFFECTIVE}</p>

        <div className="mt-8 space-y-2">
          <P>This Privacy Policy explains how PropScope, operated by [Your Legal Entity] ("PropScope," "we," "us"),
            collects, uses, and shares information when you use our website and services (the "Service").</P>

          <H>1. Information we collect</H>
          <P><b>Account information</b> — your name, email, and optionally company and phone number, which you
            provide at signup or in your profile.</P>
          <P><b>Property and deal inputs</b> — the addresses and figures you enter to generate reports, and the
            reports produced.</P>
          <P><b>Payment information</b> — subscriptions and purchases are processed by Stripe. We do not see or
            store your full card number; Stripe handles card data directly. We receive limited billing details
            such as your plan, subscription status, and the last four digits of your card.</P>
          <P><b>Usage information</b> — basic technical data such as log data and interactions, used to operate and
            improve the Service.</P>

          <H>2. How we use information</H>
          <P>We use information to provide and operate the Service (including generating your reports), process
            payments, maintain your account, provide support, keep the Service secure, and comply with legal
            obligations. Property inputs are used to produce your analysis and are associated with your account.</P>

          <H>3. How we share information</H>
          <P>We share information with service providers that help us run the Service, including: <b>Supabase</b>
            (accounts and database), <b>Stripe</b> (payments), <b>Anthropic</b> (AI analysis), <b>RentCast</b>
            (property market data), and <b>Vercel</b> (hosting). These providers process data on our behalf under
            their own terms. We may also disclose information to comply with law or protect our rights. We do
            <b> not</b> sell your personal information.</P>

          <H>4. Data retention</H>
          <P>We retain account and report data for as long as your account is active or as needed to provide the
            Service, and as required for legal, accounting, or security purposes. You may request deletion (see
            "Your rights").</P>

          <H>5. Security</H>
          <P>We use reasonable technical and organizational measures to protect your information, including access
            controls and encryption in transit. No system is perfectly secure, and we cannot guarantee absolute
            security.</P>

          <H>6. Your rights</H>
          <P>You may access and update your profile in the app, and you may request that we correct or delete your
            personal information by contacting us. Depending on where you live, you may have additional rights
            under applicable privacy laws.</P>

          <H>7. Cookies and local storage</H>
          <P>We use essential cookies and browser storage to keep you signed in and remember preferences (such as
            dark mode). We do not use these for third-party advertising.</P>

          <H>8. Children</H>
          <P>The Service is not directed to anyone under 18, and we do not knowingly collect information from
            children.</P>

          <H>9. Changes to this policy</H>
          <P>We may update this policy from time to time. Material changes will be reflected by updating the "Last
            updated" date above.</P>

          <H>10. Contact</H>
          <P>Questions about privacy? Contact us at [support@getpropscope.com].</P>
        </div>
      </div>
    </Section>
  )
}

function H({ children }) { return <h2 className="pt-6 text-xl font-bold text-ink-900">{children}</h2> }
function P({ children }) { return <p className="text-ink-600 leading-relaxed">{children}</p> }
