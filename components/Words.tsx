import { Fragment, type CSSProperties } from "react";

// Splits text into word spans with an index, for per-word scroll animations in CSS.
// The space stays outside the span: inline-block elements drop trailing whitespace.
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="w" style={{ "--i": start + i } as CSSProperties}>
        {w}
      </span>
    </Fragment>
  ));
}
