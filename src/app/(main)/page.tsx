import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
      <div className="flex min-h-screen flex-col items-center justify-between px-6 py-8 [background:var(--color-bg)]">
        {/* Top Bar / Brand Identification */}
        <header className="w-full max-w-sm text-center">
          <p className="text-xs font-bold tracking-[0.2em] [color:var(--color-muted)] uppercase">
            CPF Financial Services
          </p>
        </header>

        {/* Main Content Card */}
        <main className="my-auto flex w-full max-w-sm flex-col items-center text-center">
          {/* Official CPF Logo Badge */}
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border p-3 shadow-xs [background:var(--color-card)] [border-color:var(--color-border)]">
            <Image
                src="/cpflogo.png"
                alt="CPF Group Logo"
                width={80}
                height={80}
                priority
                className="object-contain"
            />
          </div>

          {/* Hero Title */}
          <h1 className="text-2xl font-semibold leading-tight [color:var(--color-ink)] [font-family:var(--font-display)]">
            Certify your status
            <br />
            from your phone
          </h1>

          {/* Reassuring Body Text */}
          <p className="mt-3 text-sm leading-relaxed [color:var(--color-muted)]">
            Confirm your pension eligibility securely so your monthly payments continue without interruption.
          </p>

          {/* Process Breakdown */}
          <div className="mt-6 w-full space-y-2 text-left">
            <div className="flex items-center gap-3.5 rounded-xl border p-3.5 shadow-2xs [background:var(--color-card)] [border-color:var(--color-border)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold [background:var(--color-ink)] [color:var(--color-card)]">
              1
            </span>
              <span className="text-xs font-semibold leading-snug [color:var(--color-ink)]">
              Enter National ID or Pension ID
            </span>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border p-3.5 shadow-2xs [background:var(--color-card)] [border-color:var(--color-border)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold [background:var(--color-ink)] [color:var(--color-card)]">
              2
            </span>
              <span className="text-xs font-semibold leading-snug [color:var(--color-ink)]">
              Take a quick photo verification
            </span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <Link
              href="/self-service"
              className="mt-8 flex h-14 w-full items-center justify-center rounded-full text-base font-semibold shadow-md transition-all active:scale-[0.99] [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]"
          >
            Start certification →
          </Link>

          {/* Explicit Support Callout */}
          <div className="mt-6 flex flex-col items-center">
            <a
                href="tel:0800720072"
                className="flex h-12 items-center justify-center gap-2 text-sm font-semibold underline underline-offset-4 [color:var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]"
            >
              <span>Need assistance? Call 0700 720 072</span>
            </a>
            <span className="text-[11px] [color:var(--color-muted)]">Toll-free customer care</span>
          </div>
        </main>

        {/* Footer Security Note */}
        <footer className="w-full max-w-sm text-center">
          <p className="text-[11px] leading-relaxed [color:var(--color-muted)]">
            🔒 End-to-end encrypted. Your data is strictly used for official CPF Life Certification.
          </p>
        </footer>
      </div>
  );
}