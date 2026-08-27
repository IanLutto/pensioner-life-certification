// components/shared/ui/Seal.tsx
//
// Same medallion motif as the landing page — reused here so "Certified"
// visually rhymes with "Start certification." animated=false gives the
// solid, already-achieved look for the done screen; animated=true is the
// breathing/pending look used on the landing page.

export function Seal({ animated = true }: { animated?: boolean }) {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center" aria-hidden="true">
      <div
        className={`absolute inset-0 rounded-full border-2 [border-color:var(--color-accent)] ${
          animated ? "seal-ring" : ""
        }`}
        style={{ borderStyle: animated ? "dashed" : "solid" }}
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-full [background:var(--color-ink)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4 10-10"
            stroke="var(--color-bg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
