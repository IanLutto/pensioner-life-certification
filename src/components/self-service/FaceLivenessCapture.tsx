"use client";

// components/self-service/FaceLivenessCapture.tsx
//
// Real camera capture — not a placeholder. Requests camera access, shows
// a live mirrored preview inside a scanner-styles HUD, counts the
// pensioner down, records a 2.5s video burst via MediaRecorder, and
// submits it for a liveness check. Only the network call at the end is
// mocked (see lib/media/liveness-client.ts) since there's no backend
// model to send real footage to yet — everything before that
// (permissions, preview, recording) is fully functional.
//
// This step is REQUIRED — no skip button in the real flow, unlike the
// fingerprint booster. The "quick skip" dev buttons bypass the camera
// entirely for fast downstream testing; they're separate from the
// mock-outcome radios, which still require a real recording to trigger.

import { useEffect, useRef, useState } from "react";
import { pickSupportedMimeType } from "@/lib/media/pick-mime-type";
import { submitLivenessCapture } from "@/lib/media/liveness-client";
import type { LivenessResult } from "@/lib/certification/types";

type Phase =
    | "idle"
    | "requesting-camera"
    | "preview"
    | "countdown"
    | "recording"
    | "uploading"
    | "error";

const RECORD_MS = 2500;

const STATUS_BADGE: Partial<Record<Phase, string>> = {
  idle: "Awaiting camera",
  "requesting-camera": "Awaiting camera",
  preview: "Positioning face",
  countdown: "Get ready",
  uploading: "Processing capture",
};

export function FaceLivenessCapture({
                                      onComplete,
                                    }: {
  onComplete: (result: LivenessResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdownValue, setCountdownValue] = useState(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [mockOutcome, setMockOutcome] = useState<LivenessResult["confidence"]>("strong");
  const [quickSimulating, setQuickSimulating] = useState<LivenessResult["confidence"] | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => stopStream(); // release the camera if the pensioner navigates away mid-flow
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function handleEnableCamera() {
    setPhase("requesting-camera");
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPhase("preview");
    } catch {
      setErrorMessage(
          "We couldn't access your camera. Check your browser's camera permission and try again."
      );
      setPhase("error");
    }
  }

  function handleStartCapture() {
    setPhase("countdown");
    setCountdownValue(3);
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownValue === 0) {
      startRecording();
      return;
    }
    const timer = setTimeout(() => setCountdownValue((v) => v - 1), 800);
    return () => clearTimeout(timer);
  }, [phase, countdownValue]);

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) {
      setErrorMessage("Camera connection was lost. Please try again.");
      setPhase("error");
      return;
    }

    const mimeType = pickSupportedMimeType();
    if (!mimeType) {
      setErrorMessage("Your browser doesn't support video capture. Try a different browser.");
      setPhase("error");
      return;
    }

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = handleRecordingComplete;
    recorderRef.current = recorder;

    setPhase("recording");
    recorder.start();
    setTimeout(() => recorder.stop(), RECORD_MS);
  }

  async function handleRecordingComplete() {
    setPhase("uploading");
    stopStream(); // done with the camera — release it before waiting on the network

    const mimeType = recorderRef.current?.mimeType ?? "video/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });

    try {
      const result = await submitLivenessCapture(blob, mockOutcome);
      onComplete(result);
    } catch {
      setErrorMessage("We couldn't check that capture. Please try again.");
      setPhase("error");
    }
  }

  function handleRetry() {
    setErrorMessage(null);
    setPhase("idle");
  }

  function handleQuickSkip(confidence: LivenessResult["confidence"]) {
    setQuickSimulating(confidence);
    setTimeout(() => {
      onComplete({ passed: true, confidence, capturedAt: new Date().toISOString() });
    }, 500);
  }

  const showingVideo = phase === "preview" || phase === "countdown" || phase === "recording";
  const badgeText = quickSimulating ? `Processing ${quickSimulating}…` : STATUS_BADGE[phase];

  return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
            Look at the camera
          </h1>
          <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]" aria-live="polite">
            {phase === "idle" && "We need your camera to confirm it's you."}
            {phase === "requesting-camera" && "Requesting camera access…"}
            {phase === "preview" && "Position your face in the frame, then start."}
            {phase === "countdown" && "Hold still…"}
            {phase === "recording" && "Recording — stay still."}
            {phase === "uploading" && "Checking your capture…"}
            {phase === "error" && errorMessage}
          </p>
        </div>

        {/* Viewfinder */}
        <div className="relative mx-auto h-72 w-full max-w-xs overflow-hidden rounded-3xl border [border-color:var(--color-border)] [background:#091417] shadow-inner">
          {/* Sensor-texture background — sits behind the video, shows through in idle/error */}
          <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                    "radial-gradient(color-mix(in srgb, var(--color-accent) 12%, transparent) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
          />

          <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)] ${
                  showingVideo ? "block" : "hidden"
              }`}
          />

          {/* HUD corner brackets — persistent across every phase */}
          <div className="absolute left-4 top-4 h-5 w-5 rounded-tl border-l-2 border-t-2 border-accent/60" />
          <div className="absolute right-4 top-4 h-5 w-5 rounded-tr border-r-2 border-t-2 border-accent/60" />
          <div className="absolute bottom-4 left-4 h-5 w-5 rounded-bl border-b-2 border-l-2 border-accent/60" />
          <div className="absolute bottom-4 right-4 h-5 w-5 rounded-br border-b-2 border-r-2 border-accent/60" />

          {/* Face silhouette guide — only shown before/without a live feed */}
          {!showingVideo && (
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg className="h-32 w-32 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
          )}

          {/* Face-guide oval — dashed while idle, solid once a real feed is active */}
          <div
              className={`absolute inset-0 m-auto h-48 w-36 rounded-[50%] border-2 border-accent/80 ${
                  showingVideo ? "" : "border-dashed"
              }`}
          />

          {/* Scan sweep — reinforces "actively scanning" before recording starts.
            Class name matches globals.css's .scan-line-active keyframe. */}
          {(phase === "preview" || phase === "countdown") && (
              <div className="scan-line-active absolute left-6 right-6 h-px bg-accent opacity-0 shadow-[0_0_10px_var(--color-accent)]" />
          )}

          {phase === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="text-5xl font-semibold text-white">{countdownValue || ""}</span>
              </div>
          )}

          {phase === "recording" && (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-white">Recording</span>
              </div>
          )}

          {badgeText && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium tracking-wide [color:var(--color-accent)] backdrop-blur-sm">
                {badgeText}
              </div>
          )}
        </div>

        {phase === "idle" && (
            <button
                onClick={handleEnableCamera}
                className="flex h-14 w-full items-center justify-center rounded-full text-base font-semibold transition-colors [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)]"
            >
              Enable camera
            </button>
        )}

        {phase === "preview" && (
            <button
                onClick={handleStartCapture}
                className="flex h-14 w-full items-center justify-center rounded-full text-base font-semibold transition-colors [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)]"
            >
              Start capture
            </button>
        )}

        {phase === "error" && (
            <button
                onClick={handleRetry}
                className="flex h-14 w-full items-center justify-center rounded-full border text-base font-medium [border-color:var(--color-border)] [color:var(--color-ink)]"
            >
              Try again
            </button>
        )}

        {process.env.NEXT_PUBLIC_USE_MOCKS === "true" && (
            <div className="rounded-2xl border border-dashed p-4 text-left [border-color:var(--color-border)]">
              <button
                  type="button"
                  onClick={() => setDevToolsOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-xs font-semibold tracking-wider [color:var(--color-muted)] uppercase"
              >
                <span>Dev simulation tools</span>
                <span className="text-base">{devToolsOpen ? "−" : "+"}</span>
              </button>

              {devToolsOpen && (
                  <div className="mt-3 flex flex-col gap-4 border-t pt-3 [border-color:var(--color-border)]">
                    <div>
                      <p className="text-xs [color:var(--color-muted)]">
                        Sets what the mocked upload returns after a real recording completes.
                      </p>
                      <div className="mt-2 flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs [color:var(--color-ink)]">
                          <input type="radio" checked={mockOutcome === "strong"} onChange={() => setMockOutcome("strong")} />
                          Recording result: strong match
                        </label>
                        <label className="flex items-center gap-2 text-xs [color:var(--color-ink)]">
                          <input type="radio" checked={mockOutcome === "borderline"} onChange={() => setMockOutcome("borderline")} />
                          Recording result: borderline match
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs [color:var(--color-muted)]">
                        Or skip the camera entirely, for testing what happens after this step.
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            disabled={!!quickSimulating}
                            onClick={() => handleQuickSkip("strong")}
                            className="h-10 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 [border-color:var(--color-border)] [color:var(--color-ink)]"
                        >
                          Skip → strong
                        </button>
                        <button
                            type="button"
                            disabled={!!quickSimulating}
                            onClick={() => handleQuickSkip("borderline")}
                            className="h-10 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 [border-color:var(--color-border)] [color:var(--color-ink)]"
                        >
                          Skip → borderline
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}
