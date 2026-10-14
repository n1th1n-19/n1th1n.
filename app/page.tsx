import type { CSSProperties } from "react";
import { getBoard } from "@/lib/github";
import { sumDays, weeks } from "@/lib/activity";
import { languageColors, spotlight, statusLabel } from "@/lib/projects";
import { EMAIL, GITHUB, NAME, SITE_URL } from "@/lib/site";
import { Nav } from "@/components/Nav";
import { Work, type Card } from "@/components/Work";
import { Heatmap } from "@/components/Heatmap";
import { AppIcon } from "@/components/AppIcon";
import { CountUp } from "@/components/CountUp";
import { CopyEmail } from "@/components/CopyEmail";
import { RelativeTime } from "@/components/RelativeTime";
import { Chevron } from "@/components/icons";
import { FlexHeadline } from "@/components/FlexHeadline";
import { Words } from "@/components/Words";
import { News } from "@/components/News";

// Per-icon parallax depth and intro tilt, so the row doesn't move as one block.
const DEPTH = [40, 70, 25, 60, 35, 80, 30, 55];

export default async function Page() {
  const { rows, checkedAt, contributions } = await getBoard();
  const live = spotlight(rows);
  // Whole GitHub profile when a token is set, otherwise commits to the projects listed here.
  const days = contributions?.days ?? sumDays(rows.map((r) => r.days));
  const unit = contributions ? "contributions" : "commits";
  const commits =
    contributions?.total ??
    weeks(checkedAt)
      .flat()
      .reduce((n, d) => n + (d ? (days[d] ?? 0) : 0), 0);
  const shipped = rows.filter((r) => r.status === "shipped").length;
  const languages = new Set(rows.map((r) => r.language)).size;

  const cards: Card[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    note: r.note,
    language: r.language,
    langColor: languageColors[r.language],
    platform: r.platform,
    status: r.status,
    version: r.version,
    icon: r.icon,
    stack: r.featured?.stack,
    pushedAt: r.pushedAt,
    href: r.public ? `https://github.com/${r.repo}` : r.links[0]?.href,
  }));

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": `${SITE_URL}/#me`, name: NAME, url: SITE_URL, email: `mailto:${EMAIL}`, sameAs: [GITHUB] },
      {
        "@type": "ItemList",
        name: `Projects by ${NAME}`,
        itemListElement: rows.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareApplication",
            name: r.name,
            description: r.tagline,
            operatingSystem: r.platform,
            applicationCategory: "DeveloperApplication",
            softwareVersion: r.version.replace(/^v/, ""),
            author: { "@id": `${SITE_URL}/#me` },
            ...(r.public ? { url: `https://github.com/${r.repo}` } : {}),
          },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Nav />

      <main>
        <section id="top" className="hero wrap" aria-label="Introduction">
          <div className="hero-copy">
            <p className="live rise" style={{ "--d": "0.2s", "--y": "0px" } as CSSProperties}>
              <i aria-hidden="true" />
              Now building <b>{live.name}</b>
              <span className="live-sep" aria-hidden="true">
                ·
              </span>
              <span className="live-when">
                <RelativeTime iso={live.pushedAt} prefix="pushed" />
              </span>
            </p>
            <FlexHeadline
              className="rise"
              style={{ "--d": "0.3s", "--y": "72px" } as CSSProperties}
              lines={[{ text: "I build the tools" }, { text: "I wish I had.", dim: true }]}
            />
            <p className="sub rise" style={{ "--d": "0.5s" } as CSSProperties}>
              Android apps, VS Code extensions, a Linux GitHub client and a couple of CLIs. {rows.length} projects, {shipped} shipped,
              built in the open.
            </p>
            <div className="ctas rise" style={{ "--d": "0.65s", "--y": "40px" } as CSSProperties}>
              <a href="#work" className="btn">
                See the work
              </a>
              <a href="#contact" className="link">
                Get in touch <Chevron />
              </a>
            </div>
          </div>
          <ul className="icons" aria-label="Projects">
            {rows.map((r, i) => (
              <li key={r.slug} className="par" style={{ "--p": DEPTH[i % DEPTH.length] } as CSSProperties}>
                <a
                  href="#work"
                  aria-label={r.name}
                  data-tilt="16"
                  style={{ "--i": i, "--r": `${i % 2 ? -14 : 14}deg` } as CSSProperties}
                  className="pop"
                >
                  <AppIcon src={r.icon} size={88} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="stats wrap" aria-label="Numbers">
          {[
            [rows.length, "Projects"],
            [shipped, "Shipped to users"],
            [commits, unit === "commits" ? "Commits this year" : "Contributions this year"],
            [languages, "Languages"],
          ].map(([v, l], i) => (
            <div key={l} className="stat reveal" style={{ "--i": i } as CSSProperties}>
              <b>
                <CountUp value={v as number} />
              </b>
              <span>{l}</span>
            </div>
          ))}
        </section>

        <section id="work" className="section wrap" aria-labelledby="work-h">
          <div className="sec-head">
            <div>
              <p className="eyebrow">01 / Work</p>
              <h2 id="work-h" className="split">
                <Words text="Selected work" />
              </h2>
            </div>
          </div>
          <Work cards={cards} />
        </section>

        <section id="about" className="section wrap about" aria-labelledby="about-h">
          <div>
            <p className="eyebrow">02 / About</p>
            <h2 id="about-h" className="sr-only">
              About
            </h2>
            <p className="statement">
              <Words text="I'm n1th1n." />{" "}
              <span className="dim">
                <Words text="I write Kotlin for the phone in my pocket, TypeScript for the editor I stare at all day, and Rust for everything in between." start={2} />
              </span>{" "}
              <Words text="Small tools, finished properly." start={26} />
            </p>
          </div>
          <div className="about-side reveal">
            <dl className="glist">
              <div>
                <dt>Languages</dt>
                <dd>Kotlin, Rust, TypeScript, Dart, JS</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>Android, VSCodium, browsers, Linux</dd>
              </div>
              <div>
                <dt>Tools</dt>
                <dd>Flutter, Meson, GitHub Actions, Figma</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>India (IST)</dd>
              </div>
            </dl>
            <p className="caption">May the almighty source code be with you.</p>
          </div>
        </section>

        <section id="now" className="section wrap" aria-labelledby="now-h">
          <p className="eyebrow">03 / Now</p>
          <h2 id="now-h" className="split">
            <Words text="On the bench" />
          </h2>
          <ul className="nowlist card reveal">
            {rows
              .filter((r) => r.now)
              .map((r) => (
                <li key={r.slug}>
                  <AppIcon src={r.icon} size={52} />
                  <div className="now-text">
                    <p>
                      <b>{r.name}</b> <span className="label mono">{r.version}</span>
                    </p>
                    <p className="now-note">{r.now}</p>
                  </div>
                  <span className={`status is-${r.status}`}>
                    <i aria-hidden="true" />
                    <span className="status-text">{statusLabel[r.status]}</span>
                  </span>
                </li>
              ))}
          </ul>
        </section>

        <section id="news" className="section wrap news-section" aria-labelledby="news-h">
          <header className="news-head">
            <p className="eyebrow">04 / News</p>
            <h2 id="news-h" className="split">
              <Words text="Updates" />
            </h2>
            <p className="news-intro">Releases, milestones and status changes, newest first.</p>
            <a href="/feed.xml" className="link">
              Follow via RSS <Chevron />
            </a>
          </header>
          <News />
        </section>

        <section id="activity" className="section section-tight wrap" aria-labelledby="activity-h">
          <p className="eyebrow">05 / Activity</p>
          <div className="sec-head">
            <h2 id="activity-h">
              {commits.toLocaleString("en-US")} {unit} <span className="dim">this year</span>
            </h2>
            <span className="legend" aria-hidden="true">
              Less
              {[0, 1, 2, 3, 4].map((l) => (
                <i key={l} data-l={l} />
              ))}
              More
            </span>
          </div>
          <Heatmap days={days} end={checkedAt} unit={unit} levels={contributions?.levels} />
        </section>

        <section id="contact" className="section wrap contact" aria-labelledby="contact-h">
          <p className="eyebrow">06 / Contact</p>
          <FlexHeadline
            as="h2"
            id="contact-h"
            className="reveal"
            lines={[{ text: "Let's build" }, { text: "something.", dim: true }]}
          />
          <div className="email reveal">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <CopyEmail email={EMAIL} />
          </div>
          <div className="ctas reveal">
            <a href={`mailto:${EMAIL}`} className="btn">
              Send an email
            </a>
            <a href={GITHUB} className="link">
              GitHub <Chevron />
            </a>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© 2026 {NAME}</span>
        <a href={GITHUB} className="mono">
          github.com/n1th1n-19
        </a>
      </footer>
    </>
  );
}
