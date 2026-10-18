import type { CSSProperties } from "react";
import { formatDate, kindLabel, type Update } from "@/lib/updates";
import { AppIcon } from "./AppIcon";
import { Chevron } from "./icons";

const SHOWN = 6;

type Who = { slug: string; name: string; icon: string };

function Item({ u, i, who }: { u: Update; i: number; who: Who[] }) {
  const p = who.find((x) => x.slug === u.project);
  return (
    <li className={`news-item is-${u.kind} reveal`} style={{ "--i": i % 3 } as CSSProperties}>
      <time dateTime={u.date}>{formatDate(u.date)}</time>
      <div className="news-body">
        <p className="news-meta">
          <span className="kind">{kindLabel[u.kind]}</span>
          {p && (
            <span className="news-project">
              <AppIcon src={p.icon} size={20} />
              {p.name}
            </span>
          )}
        </p>
        <h3>{u.title}</h3>
        <p className="news-text">{u.body}</p>
        {u.href && (
          <a href={u.href} className="link">
            {u.cta ?? (u.kind === "release" ? "Release notes" : "Read more")} <Chevron />
          </a>
        )}
      </div>
    </li>
  );
}

export function News({ items, who }: { items: Update[]; who: Who[] }) {
  const older = items.slice(SHOWN);
  return (
    <div className="news">
      <ol className="timeline">
        {items.slice(0, SHOWN).map((u, i) => (
          <Item key={u.date + u.title} u={u} i={i} who={who} />
        ))}
      </ol>
      {older.length > 0 && (
        <details className="older">
          <summary>
            Show {older.length} older update{older.length === 1 ? "" : "s"}
          </summary>
          <ol className="timeline">
            {older.map((u, i) => (
              <Item key={u.date + u.title} u={u} i={i} who={who} />
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
