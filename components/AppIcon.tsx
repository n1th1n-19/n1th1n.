import Image from "next/image";
import type { CSSProperties } from "react";

export function AppIcon({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  return (
    <span className={`appicon ${className}`} style={{ "--s": `${size}px` } as CSSProperties}>
      {/* Icons of auto-discovered repos come from GitHub; serve those as-is. */}
      <Image src={src} alt="" width={size} height={size} unoptimized={src.startsWith("http")} />
    </span>
  );
}
