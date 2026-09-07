"use client";

import { useState } from "react";
import type { LivenessResult } from "@/lib/certification/types";

export function FaceLivenessStepPlaceholder({
                                                onComplete,
                                            }: {
    onComplete: (result: LivenessResult) => void;
}) {
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const [simulating, setSimulating] = useState<"strong" | "borderline" | null>(null);

    function simulate(confidence: LivenessResult["confidence"]) {
        setSimulating(confidence);
        setTimeout(() => {
            onComplete({
                passed: true,
                confidence,
                capturedAt: new Date().toISOString(),
            });
        }, 600);
    }

    return (
        <div className="flex flex-col gap-6 text-center">
            <div>
                <h1 className="text-xl font-semibold leading-snug text-ink font-display">
                    Look at the camera
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted">
                    Position your face inside the frame and hold still.
                </p>
            </div>

            {/* Viewfinder Container */}
            {/*<div className="relative mx-auto flex h-72 w-full max-w-xs items-center justify-center overflow-hidden rounded-3xl bg-[#0b1411] shadow-inner border border-border"><div className="relative mx-auto flex h-72 w-full max-w-xs items-center justify-center overflow-hidden rounded-3xl bg-[#0b1411] shadow-inner border border-border">*/}
            <div className="relative mx-auto flex h-72 w-full max-w-xs items-center justify-center overflow-hidden rounded-3xl bg-[#091417] shadow-inner border border-border">
            {/* Subtle grid background pattern to imply active sensor */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(#b8823f 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                    }}
                />

                {/* Framing HUD Corners */}
                <div className="absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-accent/60 rounded-tl" />
                <div className="absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-accent/60 rounded-tr" />
                <div className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-accent/60 rounded-bl" />
                <div className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-accent/60 rounded-br" />

                {/* Face Silhouette Vector */}
                <div className="relative z-10 flex flex-col items-center justify-center opacity-30 transition-opacity duration-300 hover:opacity-40">
                    <svg
                        className="h-36 w-36 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>

                {/* Face-Guide Oval */}
                <div className="absolute z-20 h-52 w-40 rounded-[50%] border-2 border-dashed border-accent/80 transition-all duration-300" />

                {/* Active Laser Sweep */}
                <div className="scan-line-active absolute left-6 right-6 z-30 h-0.5 bg-accent shadow-[0_0_12px_var(--color-accent)]" />

                {/* Status Badge */}
                <div className="absolute bottom-4 z-30 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium tracking-wide text-accent backdrop-blur-md">
                    {simulating ? `Processing ${simulating}...` : "Positioning Face"}
                </div>
            </div>

            {/* Dev Tools Accordion */}
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-left transition-all">
                <button
                    type="button"
                    onClick={() => setDevToolsOpen((v) => !v)}
                    className="flex w-full items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase focus:outline-none"
                >
                    <span>Dev Simulation Tools</span>
                    <span className="text-base">{devToolsOpen ? "−" : "+"}</span>
                </button>

                {devToolsOpen && (
                    <div className="mt-3 flex flex-col gap-2.5 border-t border-border/60 pt-3">
                        <p className="text-xs text-muted">
                            Select an outcome to test downstream certification behavior.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={!!simulating}
                                onClick={() => simulate("strong")}
                                className="h-10 rounded-xl border border-border bg-card text-xs font-semibold text-ink transition-all hover:border-accent hover:bg-accent/5 active:scale-95 disabled:opacity-50"
                            >
                                Pass (Strong)
                            </button>
                            <button
                                type="button"
                                disabled={!!simulating}
                                onClick={() => simulate("borderline")}
                                className="h-10 rounded-xl border border-border bg-card text-xs font-semibold text-ink transition-all hover:border-accent hover:bg-accent/5 active:scale-95 disabled:opacity-50"
                            >
                                Pass (Borderline)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}