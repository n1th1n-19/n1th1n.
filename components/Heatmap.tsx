import type { CSSProperties } from "react";
import { weeks, level, DAY_STEPS } from "@/lib/activity";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d: string) => `${MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}`;

// GitHub's contribution graph. On narrow screens it scrolls, starting at this week.
// `levels` are GitHub's own quartiles when the data came from the GitHub calendar.
export function Heatmap({ days, end, unit, levels }: { days: Record<string, number>; end: string; unit: string; levels?: Record<string, number> }) {
  const cols = weeks(end);
  const total = cols.flat().reduce((n, d) => n + (d ? (days[d] ?? 0) : 0), 0);

  return (
    <div className="heat-card card reveal">
      <div className="heat">
        <div className="heat-days" aria-hidden="true">
          <span />
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="heat-scroll">
          <div className="heat-grid" role="img" aria-label={`${total} ${unit} in the last year`}>
            {cols.map((col, i) => {
              const first = col[0]!;
              const prev = cols[i - 1]?.[0];
              const month = i > 0 && (!prev || first.slice(5, 7) !== prev.slice(5, 7)) ? MONTHS[+first.slice(5, 7) - 1] : "";
              return (
                <div className="wk" key={first} style={{ "--w": i } as CSSProperties} aria-hidden="true">
                  <span className="mo">{month}</span>
                  {col.map((d, j) =>
                    d ? (
                      <i
                        key={j}
                        data-l={levels ? (levels[d] ?? 0) : level(days[d] ?? 0, DAY_STEPS)}
                        title={`${days[d] || "No"} ${days[d] === 1 ? unit.slice(0, -1) : unit} on ${fmt(d)}`}
                      />
                    ) : (
                      <i key={j} className="empty" />
                    ),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
