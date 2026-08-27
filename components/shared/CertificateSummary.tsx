// components/shared/CertificateSummary.tsx
//
// "Minimal certificate issuance for internal demo" — Phase 1 PoC scope.
// QR + digital signature are explicitly Phase 3 ("Enhanced certificate").
// Don't add them here early; a half-real signature/QR is worse than none.

import type { CertificateSummary as CertificateSummaryType } from "@/lib/certification/types";

export function CertificateSummary({ certificate }: { certificate: CertificateSummaryType }) {
  return (
    <dl className="mt-6 w-full rounded-xl border [border-color:var(--color-border)] p-4 text-left text-sm">
      <div className="flex justify-between py-1">
        <dt className="[color:var(--color-muted)]">Pensioner ID</dt>
        <dd className="[color:var(--color-ink)]">{certificate.pensionerId}</dd>
      </div>
      <div className="flex justify-between py-1">
        <dt className="[color:var(--color-muted)]">Certified on</dt>
        <dd className="[color:var(--color-ink)]">
          {new Date(certificate.issuedAt).toLocaleDateString()}
        </dd>
      </div>
      <div className="flex justify-between py-1">
        <dt className="[color:var(--color-muted)]">Status</dt>
        <dd className="font-semibold capitalize [color:var(--color-ink)]">{certificate.status}</dd>
      </div>
    </dl>
  );
}
