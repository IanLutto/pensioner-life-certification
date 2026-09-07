const STEPS = ["Identity", "Verify code", "Liveness check", "Confidence check"] as const;

type Props = {
    stepIndex: number; // 0-3, matches STEPS
    title?: string;
    onBack?: () => void;
    children: React.ReactNode;
};

export function FlowShell({ stepIndex, title, onBack, children }: Props) {
    const currentLabel = title || STEPS[stepIndex] || "Verification";

    return (
        <div className="flex min-h-screen flex-col items-center justify-between px-4 py-8 sm:justify-center [background:var(--color-bg)]">
            <header className="w-full max-w-sm pt-2">
                {/* Navigation Bar / Back Action */}
                <div className="relative mb-6 flex h-10 items-center justify-center">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="Go to previous step"
                            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors [color:var(--color-ink)] hover:[background:var(--color-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]"
                        >
                            ←
                        </button>
                    )}
                    <span className="text-xs font-bold tracking-widest uppercase [color:var(--color-muted)]">
                        CPF · Step {stepIndex + 1} of {STEPS.length}
                    </span>
                </div>

                {/* Progress Indicators */}
                <ol className="flex items-center justify-center gap-2" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}: ${currentLabel}`}>
                    {STEPS.map((label, i) => {
                        const isCurrent = i === stepIndex;
                        const isCompleted = i < stepIndex;

                        return (
                            <li key={label} className="flex items-center gap-2">
                                <span
                                    aria-current={isCurrent ? "step" : undefined}
                                    title={`Step ${i + 1}: ${label}`}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        isCurrent
                                            ? "w-6 [background:var(--color-accent)]"
                                            : isCompleted
                                                ? "w-2.5 [background:var(--color-focus)]"
                                                : "w-2.5 [background:var(--color-border)]"
                                    }`}
                                />
                                {i < STEPS.length - 1 && (
                                    <span
                                        className={`h-0.5 w-3 transition-colors ${
                                            isCompleted ? "[background:var(--color-focus)]" : "[background:var(--color-border)]"
                                        }`}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </header>

            {/* Main Form Container Card */}
            <main className="my-auto w-full max-w-sm py-4">
                <div className="rounded-3xl border p-6 shadow-xs sm:p-8 [background:var(--color-card)] [border-color:var(--color-border)]">
                    {children}
                </div>
            </main>

            {/* Footer Trust Note */}
            <footer className="w-full max-w-sm text-center">
                <p className="text-[11px] [color:var(--color-muted)]">
                    Official CPF Pensioner Verification Platform
                </p>
            </footer>
        </div>
    );
}