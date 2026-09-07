// lib/media/pick-mime-type.ts
//
// Safari (as of recent versions) supports "video/mp4" for MediaRecorder
// but not "video/webm"; Chrome/Firefox/Edge are the reverse. Without this
// check, recording silently fails or throws on whichever browser wasn't
// tested against.

const CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

export function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}
