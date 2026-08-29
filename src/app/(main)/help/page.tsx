// app/(main)/help/page.tsx
//
// Reachable from anywhere via the bottom nav, not just the landing
// page's "Need help?" link — useful if a pensioner gets stuck mid-flow
// and backs out, or just wants the number without starting certification.

export default function HelpPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold leading-snug text-ink font-display">
          Need help?
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Call us and we'll walk you through it, or help you certify at a
          CPF office instead.
        </p>

        <a
          href="tel:+254700000000"
          className="mt-8 flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-accent-ink transition-colors bg-accent hover:bg-accent-hover"
        >
          Call +254 700 000 000
        </a>

        <div className="mt-10 flex flex-col gap-4 text-left">
          <FaqItem
            question="What do I need to certify?"
            answer="Your National ID number and access to your phone camera. That's it."
          />
          <FaqItem
            question="What if I don't have a smartphone?"
            answer="Visit any CPF office and a staff member can certify you in person."
          />
          <FaqItem
            question="How often do I need to do this?"
            answer="Once every certification period — we'll notify you when yours is coming up."
          />
        </div>
      </div>
    </main>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-ink">{question}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{answer}</p>
    </div>
  );
}
