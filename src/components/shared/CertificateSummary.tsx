// components/shared/CertificateSummary.tsx
//
// "Minimal certificate issuance for internal demo" — Phase 1 PoC scope.
// QR + digital signature are explicitly Phase 3 ("Enhanced certificate").
// Don't add them here early; a half-real signature/QR is worse than none.

import type { CertificateSummary as CertificateSummaryType } from "@/lib/certification/types";

export function CertificateSummary({ certificate }: { certificate: CertificateSummaryType }) {
    return (
        <dl className="mt-6 w-full rounded-xl border border-border p-4 text-left text-sm">
            <div className="flex justify-between py-1">
                <dt className="text-muted">Pensioner ID</dt>
                <dd className="text-ink">{certificate.pensionerId}</dd>
            </div>
            <div className="flex justify-between py-1">
                <dt className="text-muted">Certified on</dt>
                <dd className="text-ink">{new Date(certificate.issuedAt).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between py-1">
                <dt className="text-muted">Status</dt>
                <dd className="font-semibold capitalize text-ink">
                    {certificate.status.replace("_", " ")}
                </dd>
            </div>
            {certificate.nextDueAt && (
                <div className="flex justify-between py-1">
                    <dt className="text-muted">Next due</dt>
                    <dd className="text-ink">{new Date(certificate.nextDueAt).toLocaleDateString()}</dd>
                </div>
            )}
        </dl>
    );
}
