"use client";

import { useSyncExternalStore } from "react";

// GitHub's <relative-time>: server renders an absolute date, browser swaps in
// "3 days ago" and keeps it ticking. Cached HTML never shows a stale "1h ago".
let now = Date.now();
function subscribe(cb: () => void) {
  const id = setInterval(() => {
    now = Date.now();
    cb();
  }, 60_000);
  return () => clearInterval(id);
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536e6],
  ["month", 2592e6],
  ["week", 6048e5],
  ["day", 864e5],
  ["hour", 36e5],
  ["minute", 6e4],
];

function relative(iso: string, at: number) {
  const diff = new Date(iso).getTime() - at;
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

const absolute = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function RelativeTime({ iso, prefix = "" }: { iso: string; prefix?: string }) {
  const at = useSyncExternalStore(subscribe, () => now, () => null);
  return (
    <time dateTime={iso} title={absolute(iso)}>
      {at === null ? `${prefix ? prefix + " on " : ""}${absolute(iso)}` : `${prefix ? prefix + " " : ""}${relative(iso, at)}`}
    </time>
  );
}
