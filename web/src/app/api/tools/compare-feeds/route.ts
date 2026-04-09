import { NextRequest, NextResponse } from "next/server";
import { DOMParser, type Element as XmlElement } from "@xmldom/xmldom";

export interface DiffLine {
  type: "same" | "added" | "removed";
  content: string;
}

export interface FeedMeta {
  title: string;
  episodeCount: number;
  guids: string[];
  error?: string;
}

export interface CompareResult {
  exactlySame: boolean;
  semanticallySame: boolean;
  semanticNotes: string[];
  feedA: FeedMeta;
  feedB: FeedMeta;
  diff: DiffLine[];
  truncated: boolean;
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchFeed(url: string): Promise<{ text: string; error?: string }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
      headers: { "User-Agent": "FreedomPodcasting-FeedComparator/1.0" },
    });
    if (!res.ok) return { text: "", error: `HTTP ${res.status}` };
    return { text: await res.text() };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : "Fetch failed" };
  }
}

// ── Normalization ──────────────────────────────────────────────────────────
// Trim each line, remove blank lines — ensures whitespace differences don't
// produce false positives in the diff.

function normalizeLines(xml: string): string[] {
  return xml
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// ── Semantic extraction ────────────────────────────────────────────────────

function extractMeta(xml: string): FeedMeta {
  if (!xml) return { title: "", episodeCount: 0, guids: [], error: "Empty feed" };
  try {
    const parser = new DOMParser({ errorHandler: () => {} });
    const doc = parser.parseFromString(xml, "text/xml");
    const channel = doc.getElementsByTagName("channel")[0] as XmlElement | undefined;
    if (!channel) return { title: "", episodeCount: 0, guids: [], error: "No <channel> found" };

    // Channel title — direct child only
    let title = "";
    for (let i = 0; i < channel.childNodes.length; i++) {
      const n = channel.childNodes[i] as XmlElement;
      if (n.nodeType === 1 && n.tagName === "title") {
        title = n.textContent?.trim() ?? "";
        break;
      }
    }

    const items = channel.getElementsByTagName("item");
    const guids: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const guid = (items[i] as XmlElement).getElementsByTagName("guid")[0]?.textContent?.trim() ?? "";
      if (guid) guids.push(guid);
    }

    return { title, episodeCount: items.length, guids };
  } catch {
    return { title: "", episodeCount: 0, guids: [], error: "XML parse failed" };
  }
}

// ── LCS diff ──────────────────────────────────────────────────────────────
// Classic O(m*n) LCS with Uint32Array for speed.
// Capped at MAX_LINES per feed to avoid memory issues.

const MAX_LINES = 3000;

function computeDiff(a: string[], b: string[]): { diff: DiffLine[]; truncated: boolean } {
  const truncated = a.length > MAX_LINES || b.length > MAX_LINES;
  const aLines = a.slice(0, MAX_LINES);
  const bLines = b.slice(0, MAX_LINES);
  const m = aLines.length;
  const n = bLines.length;

  // If product is too large, fall back to naive diff
  if (m * n > 4_000_000) {
    const diff: DiffLine[] = [
      ...aLines.map((content) => ({ type: "removed" as const, content })),
      ...bLines.map((content) => ({ type: "added" as const, content })),
    ];
    return { diff, truncated: true };
  }

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        aLines[i - 1] === bLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Traceback
  const diff: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      diff.unshift({ type: "same", content: aLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: "added", content: bLines[j - 1] });
      j--;
    } else {
      diff.unshift({ type: "removed", content: aLines[i - 1] });
      i--;
    }
  }

  return { diff, truncated };
}

// ── Semantic comparison ────────────────────────────────────────────────────

function compareSemantics(a: FeedMeta, b: FeedMeta): { same: boolean; notes: string[] } {
  const notes: string[] = [];

  if (a.title !== b.title) {
    notes.push(`Channel title differs: "${a.title}" vs "${b.title}"`);
  }

  if (a.episodeCount !== b.episodeCount) {
    notes.push(`Episode count differs: ${a.episodeCount} vs ${b.episodeCount}`);
  }

  const setA = new Set(a.guids);
  const setB = new Set(b.guids);
  const onlyInA = a.guids.filter((g) => !setB.has(g));
  const onlyInB = b.guids.filter((g) => !setA.has(g));

  if (onlyInA.length > 0) {
    notes.push(
      `${onlyInA.length} GUID(s) in original feed not found in new feed — episodes may be missing`
    );
  }
  if (onlyInB.length > 0) {
    notes.push(
      `${onlyInB.length} GUID(s) in new feed not found in original — extra episodes added`
    );
  }

  return { same: notes.length === 0, notes };
}

// ── Route ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const a = req.nextUrl.searchParams.get("a");
  const b = req.nextUrl.searchParams.get("b");
  if (!a || !b) {
    return NextResponse.json({ error: "Both ?a= and ?b= URL parameters are required" }, { status: 400 });
  }

  const [resA, resB] = await Promise.all([fetchFeed(a), fetchFeed(b)]);

  const metaA = resA.error ? { title: "", episodeCount: 0, guids: [], error: resA.error } : extractMeta(resA.text);
  const metaB = resB.error ? { title: "", episodeCount: 0, guids: [], error: resB.error } : extractMeta(resB.text);

  // Can't diff if either feed failed
  if (resA.error || resB.error) {
    return NextResponse.json({
      exactlySame: false,
      semanticallySame: false,
      semanticNotes: [],
      feedA: metaA,
      feedB: metaB,
      diff: [],
      truncated: false,
    } satisfies CompareResult);
  }

  const linesA = normalizeLines(resA.text);
  const linesB = normalizeLines(resB.text);

  const exactlySame =
    linesA.length === linesB.length && linesA.every((l, i) => l === linesB[i]);

  // Skip expensive diff computation when feeds are identical
  if (exactlySame) {
    return NextResponse.json({
      exactlySame: true,
      semanticallySame: true,
      semanticNotes: [],
      feedA: metaA,
      feedB: metaB,
      diff: [],
      truncated: false,
    } satisfies CompareResult);
  }

  const { diff, truncated } = computeDiff(linesA, linesB);
  const { same, notes } = compareSemantics(metaA, metaB);

  return NextResponse.json({
    exactlySame: false,
    semanticallySame: same,
    semanticNotes: notes,
    feedA: metaA,
    feedB: metaB,
    diff,
    truncated,
  } satisfies CompareResult);
}
