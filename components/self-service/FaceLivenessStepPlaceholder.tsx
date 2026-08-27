"use client";

// components/self-service/FaceLivenessStepPlaceholder.tsx
//
// Stand-in for Kevin's Part A component. Swap this import out for the
// real one once it lands. The contract this flow expects: an onComplete
// callback firing with a LivenessResult that includes a confidence tier —
// "strong" skips straight to certification, "borderline" routes into the
// fingerprint booster step. This step itself is REQUIRED, unlike fingerprint.

import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { SecondaryButton } from "@/components/shared/ui/SecondaryButton";

export type LivenessResult = {
  passed: boolean;
  confidence: "strong" | "borderline";
  capturedAt: string;
};

export function FaceLivenessStepPlaceholder({
  onComplete,
}: {
  onComplete: (result: LivenessResult) => void;
}) {
  function simulate(confidence: LivenessResult["confidence"]) {
    onComplete({ passed: true, confidence, capturedAt: new Date().toISOString() });
  }

  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
          Look at the camera
        </h1>
        <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]">
          [Kevin&#39;s face + liveness capture component goes here]
        </p>
      </div>

      <PrimaryButton onClick={() => simulate("strong")}>
        (dev only) Simulate strong match
      </PrimaryButton>
      <SecondaryButton onClick={() => simulate("borderline")}>
        (dev only) Simulate borderline match
      </SecondaryButton>
    </div>
  );
}
