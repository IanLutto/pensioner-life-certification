// app/page.tsx
//
// First screen in the flow: launch → this → "Start Certification" →
// /self-service (National ID entry, already built). Kept deliberately
// calm and low-friction — this is a civic service screen for an audience
// that skews older, not a marketing page, so no scroll, no carousel,
// one clear action above the fold.

import Link from "next/link";
import { Seal } from "@/components/shared/ui/Seal";

export default function Home() {
  return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 [background:var(--color-bg)]">
        <main className="flex w-full max-w-sm flex-col items-center text-center">
          <p className="mb-8 text-xs font-semibold tracking-[0.2em] [color:var(--color-muted)] uppercase">
            CPF · Pension Services
          </p>

          <Seal />

          <h1 className="mt-8 text-[1.75rem] font-semibold leading-tight [color:var(--color-ink)] [font-family:var(--font-display)]">
            Certify your status
            <br />
            from your phone
          </h1>

          <p className="mt-4 text-base leading-7 [color:var(--color-muted)]">
            Confirm you're still with us so your pension payments continue
            without interruption.
          </p>

          <Link
              href="/self-service"
              className="mt-10 flex h-14 w-full items-center justify-center rounded-full text-base font-semibold transition-colors [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]"
          >
            Start certification
          </Link>

          <a
              href="tel:+254700000000"
              className="mt-6 flex h-12 items-center justify-center px-4 text-base font-medium underline underline-offset-4 [color:var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]"
          >
            Need help? Call us
          </a>

          <p className="mt-10 max-w-xs text-xs leading-5 [color:var(--color-muted)]">
            Your information is encrypted and used only to confirm your
            pension continues.
          </p>
        </main>
      </div>
  );
}
