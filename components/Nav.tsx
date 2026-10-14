"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { GITHUB } from "@/lib/site";
import { GitHubIcon } from "./icons";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "now", label: "Now" },
  { id: "activity", label: "Activity" },
  { id: "contact", label: "Contact" },
];

// SF Symbols can't ship on the web, so these are drawn to match their shapes.
const TABS = [
  { id: "top", label: "Home", icon: <path d="M12 3.3 2.9 10.9a1 1 0 0 0 1.3 1.6l.8-.7V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-8.2l.8.7a1 1 0 0 0 1.3-1.6Z" fill="currentColor" /> },
  { id: "work", label: "Work", icon: <g fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.9" y="4.4" width="18.2" height="15.2" rx="3.2" /><path d="M2.9 9h18.2" /><circle cx="6" cy="6.7" r=".6" fill="currentColor" /><circle cx="8.2" cy="6.7" r=".6" fill="currentColor" /></g> },
  { id: "about", label: "About", icon: <g fill="currentColor"><circle cx="12" cy="7.8" r="4.2" /><path d="M3.8 20.4c0-4.1 3.7-6.6 8.2-6.6s8.2 2.5 8.2 6.6a.6.6 0 0 1-.6.6H4.4a.6.6 0 0 1-.6-.6Z" /></g> },
  { id: "now", label: "Now", icon: <path d="M2 12.5h4.2l2.4-6.2 4 13 3-9.3 1.4 2.5H22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: "contact", label: "Contact", icon: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.6" /><path d="m3.6 6.4 8.4 6.6 8.4-6.6" /></g> },
];

export function Nav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ["top", ...LINKS.map((l) => l.id)]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  // Activity has no tab of its own on phones; it lives under Now.
  const tab = TABS.findIndex((t) => t.id === (active === "activity" ? "now" : active));

  return (
    <>
      <nav className="gnav glass" aria-label="Primary">
        <a href="#top" className="wordmark">
          n1th1n<span>.</span>
        </a>
        <div className="gnav-links">
          <span className="gnav-pill" data-on={active !== "top"} aria-hidden="true" />
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? "location" : undefined}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="gnav-actions">
          <a href={GITHUB} className="icon-btn" aria-label="GitHub profile">
            <GitHubIcon />
          </a>
          <a href="#contact" className="btn btn-sm">
            Get in touch
          </a>
        </div>
      </nav>

      <header className="mhead">
        <a href="#top" className="wordmark">
          n1th1n<span>.</span>
        </a>
        <a href={GITHUB} className="icon-btn" aria-label="GitHub profile">
          <GitHubIcon size={22} />
        </a>
      </header>

      <nav className="tabbar glass" aria-label="Sections" style={{ "--i": Math.max(tab, 0) } as CSSProperties}>
        <span className="tab-pill" aria-hidden="true" />
        {TABS.map((t, i) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            aria-current={i === tab ? "location" : undefined}
            onClick={() => navigator.vibrate?.(8)}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              {t.icon}
            </svg>
            {t.label}
          </a>
        ))}
      </nav>
    </>
  );
}
