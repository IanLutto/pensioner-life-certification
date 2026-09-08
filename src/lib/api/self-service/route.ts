import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const nationalId = searchParams.get("nationalId");
    const refToken = searchParams.get("ref");

    // Support both National ID lookups and public QR token verifications
    if (refToken) {
        // TODO: Query backend by opaque verificationToken
        return NextResponse.json({
            certificate: {
                pensionerId: "******78", // Mask ID when retrieved via public QR
                issuedAt: new Date().toISOString(),
                status: "certified",
                verificationToken: refToken,
            },
        });
    }

    if (nationalId) {
        // Standard authenticated/direct lookup logic
        return NextResponse.json({ /* certificate details */ });
    }

    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
}