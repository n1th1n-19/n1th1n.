"use client";

import { useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { statusLabel, type Status } from "@/lib/projects";
import { AppIcon } from "./AppIcon";
import { RelativeTime } from "./RelativeTime";
import { Chevron } from "./icons";

export type Card = {
  slug: string;
  name: string;
  tagline: string;
  note: string;
  language: string;
  langColor: string;
  platform: string;
  status: Status;
  version: string;
  icon: string;
  stack?: string;
  pushedAt: string;
  href?: string;
};

const FILTERS: { key: string; label: string; match: (s: Status) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "motion", label: "In motion", match: (s) => s === "building" || s === "rc" },
  { key: "shipped", label: "Shipped", match: (s) => s === "shipped" },
  { key: "paused", label: "Paused", match: (s) => s === "paused" },
];

function Badge({ status, dotOnly = false }: { status: Status; dotOnly?: boolean }) {
  return (
    <span className={`status is-${status}`}>
      <i aria-hidden="true" />
      <span className={dotOnly ? "sr-only" : undefined}>{statusLabel[status]}</span>
    </span>
  );
}

function Lang({ c }: { c: Card }) {
  return (
    <span className="lang">
      <i style={{ background: c.langColor }} aria-hidden="true" />
      {c.language}
    </span>
  );
}

function Featured({ c, i }: { c: Card; i: number }) {
  return (
    <article className="fcard card reveal" data-tilt="3" style={{ "--i": i, viewTransitionName: `p-${c.slug}` } as CSSProperties}>
      <div className="fcard-top">
        <Badge status={c.status} />
        <span className="label mono">{c.version}</span>
      </div>
      <div className="fcard-id">
        <AppIcon src={c.icon} size={104} />
        <div>
          <h3>{c.name}</h3>
          <p>{c.platform}</p>
        </div>
      </div>
      <p className="fcard-tag">{c.tagline}</p>
      <p className="fcard-note">{c.note}</p>
      <dl className="facts">
        <div>
          <dt>Status</dt>
          <dd>{c.status === "building" ? "Pre-release" : statusLabel[c.status]}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{c.stack}</dd>
        </div>
        <div>
          <dt>Last push</dt>
          <dd>
            <RelativeTime iso={c.pushedAt} />
          </dd>
        </div>
      </dl>
      <div className="fcard-foot">
        <Lang c={c} />
        {c.href && (
          <a href={c.href} className="link">
            Read more <Chevron />
          </a>
        )}
      </div>
    </article>
  );
}

function Small({ c, i }: { c: Card; i: number }) {
  const body = (
    <>
      <AppIcon src={c.icon} size={56} className="pc-icon" />
      <span className="label mono pc-ver">{c.version}</span>
      <h3 className="pc-name">{c.name}</h3>
      <p className="pc-tag">{c.tagline}</p>
      <span className="pc-status">
        <Badge status={c.status} />
      </span>
      <span className="pc-lang">
        <Lang c={c} />
      </span>
      <span className="pc-chev">
        <Chevron />
      </span>
    </>
  );
  const style = { "--i": i, viewTransitionName: `p-${c.slug}` } as CSSProperties;
  return c.href ? (
    <a href={c.href} className="pcard card reveal" data-tilt="7" data-lift="-4" style={style}>
      {body}
    </a>
  ) : (
    <article className="pcard card reveal" style={style}>
      {body}
    </article>
  );
}

export function Work({ cards }: { cards: Card[] }) {
  const [filter, setFilter] = useState("all");
  const match = FILTERS.find((f) => f.key === filter)!.match;
  const shown = cards.filter((c) => match(c.status));
  const featured = shown.filter((c) => c.stack);
  const rest = shown.filter((c) => !c.stack);

  function pick(key: string) {
    const go = () => setFilter(key);
    // View transitions animate the cards into their new places where supported.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(() => flushSync(go));
    } else go();
  }

  return (
    <>
      <div className="chips" role="toolbar" aria-label="Filter projects">
        {FILTERS.map((f) => {
          const n = cards.filter((c) => f.match(c.status)).length;
          const on = f.key === filter;
          return (
            <button key={f.key} type="button" className="chip" aria-pressed={on} onClick={() => pick(f.key)}>
              {on && (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {f.label} <span className="count">{n}</span>
            </button>
          );
        })}
      </div>
      {featured.length > 0 && (
        <div className="featured">
          {featured.map((c, i) => (
            <Featured key={c.slug} c={c} i={i} />
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid">
          {rest.map((c, i) => (
            <Small key={c.slug} c={c} i={i % 3} />
          ))}
        </div>
      )}
    </>
  );
}
