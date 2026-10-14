import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { projects } from "@/lib/projects";

export const alt = "n1th1n: I build the tools I wish I had.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const icons = await Promise.all(
  projects.map(async (p) => `data:image/png;base64,${(await readFile(join(process.cwd(), "public", p.icon))).toString("base64")}`),
);

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#000", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80 }}>
        <div style={{ fontSize: 28, color: "#0A84FF", letterSpacing: 1 }}>n1th1n.</div>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, marginTop: 24, display: "flex", flexDirection: "column" }}>
          <span>I build the tools</span>
          <span style={{ color: "#98989F" }}>I wish I had.</span>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 56 }}>
          {icons.map((src, i) => (
            <img key={i} src={src} alt="" width={84} height={84} style={{ borderRadius: 19 }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
