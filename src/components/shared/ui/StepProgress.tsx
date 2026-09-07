// components/shared/ui/StepProgress.tsx

type Props = {
  steps: string[];
  currentIndex: number; // 0-based
};

export function StepProgress({ steps, currentIndex }: Props) {
  return (
    <ol className="flex items-center justify-center gap-2" aria-label="Certification progress">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-transform
                ${isDone || isCurrent ? "[background-color:var(--color-accent)]" : "[background-color:var(--color-border)]"}
                ${isCurrent ? "scale-125" : ""}`}
              aria-hidden="true"
            />
            {i < steps.length - 1 && (
              <span className="h-px w-6 [background-color:var(--color-border)]" aria-hidden="true" />
            )}
          </li>
        );
      })}
      <span className="sr-only">
        Step {currentIndex + 1} of {steps.length}: {steps[currentIndex]}
      </span>
    </ol>
  );
}
