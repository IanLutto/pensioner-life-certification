// lib/media/liveness-client.ts
//
// Contract assumed for the real endpoint (confirm with backend once
// Kevin's research becomes an actual spec): POST multipart/form-data with
// field "video" -> { passed: boolean, confidence: "strong" | "borderline",
// capturedAt: string }. This shape matches LivenessResult in
// lib/certification/types.ts — if the real model returns something
// richer (a numeric score, separate liveness/match confidences), both
// this function's return type and LivenessResult need to change together.

import type { LivenessResult } from "@/lib/certification/types";

export async function submitLivenessCapture(
  videoBlob: Blob,
  mockOverride: LivenessResult["confidence"]
): Promise<LivenessResult> {
  // TODO(remove once FastAPI /liveness/check is live): mocked. The
  // capture itself (camera, recording) is real — only this network call
  // is faked, since there's no backend liveness model to send it to yet.
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    await new Promise((r) => setTimeout(r, 900)); // mimic model inference time
    return { passed: true, confidence: mockOverride, capturedAt: new Date().toISOString() };
  }

  const formData = new FormData();
  formData.append("video", videoBlob, "liveness-capture.webm");

  const res = await fetch("/api/liveness/check", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Liveness check failed");
  }

  return res.json();
}
