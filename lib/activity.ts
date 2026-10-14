const DAY = 864e5;

// 53 week columns of 7 ISO days (Sun..Sat) ending at `endISO`, GitHub-style.
// Days after `endISO` are null so the last column renders partially.
export function weeks(endISO: string): (string | null)[][] {
  const end = new Date(endISO.slice(0, 10) + "T00:00:00Z");
  const start = new Date(end.getTime() - 52 * 7 * DAY - end.getUTCDay() * DAY);
  const cols: (string | null)[][] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += 7 * DAY) {
    cols.push(
      Array.from({ length: 7 }, (_, i) => {
        const d = t + i * DAY;
        return d <= end.getTime() ? new Date(d).toISOString().slice(0, 10) : null;
      }),
    );
  }
  return cols;
}

// 0..4 intensity, same five steps as the GitHub contribution graph.
// `steps` are the counts where levels 2, 3 and 4 start.
export const level = (n: number, steps: [number, number, number]) =>
  n === 0 ? 0 : n < steps[0] ? 1 : n < steps[1] ? 2 : n < steps[2] ? 3 : 4;

export const DAY_STEPS: [number, number, number] = [3, 6, 11];
export const WEEK_STEPS: [number, number, number] = [4, 10, 20];

export function sumDays(maps: Record<string, number>[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of maps) for (const [d, n] of Object.entries(m)) out[d] = (out[d] ?? 0) + n;
  return out;
}
