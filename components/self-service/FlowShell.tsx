// components/self-service/FlowShell.tsx
//
// Progress dots are justified here specifically because this genuinely is
// an ordered sequence the pensioner needs to track ("how much is left"),
// unlike a generic 01/02/03 decoration. Four steps map to the four
// possible stages before certification; step 4 (fingerprint booster) is
// conditional — only reached on a borderline liveness result — but still
// gets a dot, since a pensioner mid-flow shouldn't see the count change
// under them. The fifth state ("done") gets its own full-screen treatment
// in SelfServiceFlow, not a fifth dot.

const STEPS = ["Identity", "Verify code", "Liveness check", "Confidence check"] as const;

type Props = {
    stepIndex: number; // 0-3, matches STEPS
    children: React.ReactNode;
};

export function FlowShell({ stepIndex, children }: Props) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 [background:var(--color-bg)]">
            <div className="w-full max-w-sm">
                <ol className="mb-8 flex items-center justify-center gap-2" aria-label="Progress">
                    {STEPS.map((label, i) => (
                        <li key={label} className="flex items-center gap-2">
              <span
                  aria-current={i === stepIndex ? "step" : undefined}
                  className={`h-2 w-2 rounded-full transition-colors ${
                      i <= stepIndex ? "[background:var(--color-accent)]" : "[background:var(--color-border)]"
                  }`}
              />
                            {i < STEPS.length - 1 && <span className="h-px w-3 [background:var(--color-border)]" />}
                        </li>
                    ))}
                </ol>
                <p className="mb-3 text-center text-xs font-semibold tracking-[0.2em] [color:var(--color-muted)] uppercase">
                    {STEPS[stepIndex]}
                </p>

                <div className="rounded-2xl border [border-color:var(--color-border)] [background:var(--color-card)] p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
