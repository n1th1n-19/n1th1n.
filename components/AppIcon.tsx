import Image from "next/image";
import type { CSSProperties } from "react";

export function AppIcon({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  return (
    <span className={`appicon ${className}`} style={{ "--s": `${size}px` } as CSSProperties}>
      <Image src={src} alt="" width={size} height={size} />
    </span>
  );
}
