"use client";

import { useEffect, useRef } from "react";

type Box = { x: number; y: number; w: number; h: number; r: number };

const DOT: Omit<Box, "x" | "y"> = { w: 20, h: 20, r: 10 };

// iPadOS-style pointer: a dot that morphs into the control under it, a text bar over copy,
// a glass label over [data-tip]. Also drives magnetic controls and [data-tilt] cards.
// Mouse/trackpad only; touch and reduced-motion users keep the system cursor and no effects.
export function PointerFX() {
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const tip = tipRef.current;
    if (!el || !tip) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("fx-pointer");

    let mx = -100;
    let my = -100;
    const cur: Box = { x: mx, y: my, ...DOT };
    const tgt: Box = { ...cur };
    let mode = "dot";
    let hover: HTMLElement | null = null; // magnetic control under the pointer
    let tilt: HTMLElement | null = null; // [data-tilt] element under the pointer
    let textSize = 20;
    let raf = 0;
    let down = false;
    let press = 1; // shrink on click, part of the same transform as the position

    const release = (node: HTMLElement | null) => {
      if (node) node.style.transform = "";
    };

    const frame = () => {
      raf = 0;
      if (mode === "control" && hover?.isConnected) {
        const b = hover.getBoundingClientRect();
        const dx = mx - (b.left + b.width / 2);
        const dy = my - (b.top + b.height / 2);
        hover.style.transform = `translate(${dx * 0.12}px, ${dy * 0.18}px)`;
        const radius = parseFloat(getComputedStyle(hover).borderTopLeftRadius) || 10;
        Object.assign(tgt, {
          x: b.left + b.width / 2 + dx * 0.2,
          y: b.top + b.height / 2 + dy * 0.26,
          w: b.width + 14,
          h: b.height + 10,
          r: Math.min((b.height + 10) / 2, radius + 5),
        });
      } else if (mode === "tip") {
        const w = tip.offsetWidth + 22;
        Object.assign(tgt, { x: mx, y: my - 30, w, h: 30, r: 15 });
      } else if (mode === "text") {
        Object.assign(tgt, { x: mx, y: my, w: 3, h: textSize * 1.15, r: 1.5 });
      } else {
        Object.assign(tgt, { x: mx, y: my, ...DOT });
      }

      if (tilt?.isConnected) {
        const b = tilt.getBoundingClientRect();
        const px = (mx - b.left) / b.width - 0.5;
        const py = (my - b.top) / b.height - 0.5;
        const deg = Number(tilt.dataset.tilt) || 6;
        const lift = tilt.dataset.lift ?? "0";
        tilt.style.transform = `perspective(900px) rotateX(${(-py * deg).toFixed(2)}deg) rotateY(${(px * deg).toFixed(2)}deg) translateY(${lift}px)`;
      }

      // Position follows quickly, shape eases a little slower: reads as one spring.
      let moving = false;
      for (const k of ["x", "y", "w", "h", "r"] as const) {
        const t = k === "x" || k === "y" ? 0.32 : 0.22;
        cur[k] += (tgt[k] - cur[k]) * t;
        if (Math.abs(tgt[k] - cur[k]) > 0.1) moving = true;
      }
      press += ((down ? 0.88 : 1) - press) * 0.35;
      if (Math.abs((down ? 0.88 : 1) - press) > 0.002) moving = true;
      // Scale must come after the translate, or it would pull the pointer toward the page origin.
      el.style.transform = `translate3d(${cur.x - cur.w / 2}px, ${cur.y - cur.h / 2}px, 0) scale(${press.toFixed(3)})`;
      el.style.width = `${cur.w}px`;
      el.style.height = `${cur.h}px`;
      el.style.borderRadius = `${cur.r}px`;
      if (moving || mode === "control") raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    // Works out what the pointer is over. Called on move, and on scroll because the page can
    // move under a still cursor (anchor links smooth-scroll right after a click).
    const update = (target: Element | null) => {
      if (!target) return;

      const nextTilt = target.closest<HTMLElement>("[data-tilt]");
      if (nextTilt !== tilt) {
        release(tilt);
        tilt = nextTilt;
      }

      const tipped = target.closest<HTMLElement>("[data-tip]");
      const control = target.closest<HTMLElement>("a, button");
      const small = control && !control.matches("[data-tilt]") && control.getBoundingClientRect().width < 360;
      const nextHover = !tipped && small ? control : null;
      if (nextHover !== hover) {
        release(hover);
        hover = nextHover;
      }

      if (tipped) {
        mode = "tip";
        if (tip.textContent !== tipped.dataset.tip) tip.textContent = tipped.dataset.tip ?? "";
      } else if (hover) {
        mode = "control";
      } else if (!control && target.closest("p, h1, h2, h3, dt, dd")) {
        mode = "text";
        textSize = parseFloat(getComputedStyle(target).fontSize) || 20;
      } else {
        mode = "dot";
      }
      el.dataset.mode = mode;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      el.dataset.visible = "true";
      update(e.target as Element);
    };
    const onScroll = () => update(document.elementFromPoint(mx, my));
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) el.dataset.visible = "false";
    };
    const onDown = () => {
      down = true;
      kick();
    };
    const onUp = () => {
      down = false;
      kick();
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      release(hover);
      release(tilt);
      root.classList.remove("fx-pointer");
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={ref} className="pointer" data-mode="dot" data-visible="false" aria-hidden="true">
      <span ref={tipRef} />
    </div>
  );
}
