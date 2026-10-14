"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Props = {
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  style?: CSSProperties;
  lines: { text: string; dim?: boolean }[];
};

// Letters near the cursor gain grade and roundness (Google Sans Flex GRAD + ROND axes).
// Neither axis changes glyph width, so nothing reflows while the pointer moves.
export function FlexHeadline({ as: Tag = "h1", id, className, style, lines }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h = ref.current;
    if (!h || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = [...h.querySelectorAll<HTMLElement>(".ch")];
    let raf = 0;
    let mx = 0;
    let my = 0;
    let active = false;

    const paint = () => {
      raf = 0;
      const box = h.getBoundingClientRect();
      const near = mx > box.left - 240 && mx < box.right + 240 && my > box.top - 240 && my < box.bottom + 240;
      if (!near && !active) return;
      active = near;
      for (const c of chars) {
        const b = c.getBoundingClientRect();
        const d = Math.hypot(mx - (b.left + b.width / 2), my - (b.top + b.height / 2));
        const k = near ? Math.max(0, 1 - d / 220) : 0;
        c.style.fontVariationSettings = k ? `"GRAD" ${Math.round(k * 100)}, "ROND" ${Math.round(k * 100)}` : "";
      }
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  const label = lines.map((l) => l.text).join(" ");
  return (
    <Tag ref={ref} id={id} className={`flex-head ${className ?? ""}`} style={style} aria-label={label}>
      {lines.map((l, i) => (
        <span key={i} className={l.dim ? "dim" : undefined} aria-hidden="true">
          {[...l.text].map((ch, j) => (ch === " " ? " " : <span key={j} className="ch">{ch}</span>))}
          {i < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
