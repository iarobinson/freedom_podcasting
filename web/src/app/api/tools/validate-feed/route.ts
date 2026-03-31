import { NextRequest, NextResponse } from "next/server";
import { DOMParser, type Document as XmlDocument, type Element as XmlElement } from "@xmldom/xmldom";

type CheckStatus = "pass" | "warn" | "fail";

interface Check {
  id: string;
  category: string;
  name: string;
  status: CheckStatus;
  message: string;
}

function buildSummary(checks: Check[]) {
  return {
    passed: checks.filter((c) => c.status === "pass").length,
    warned: checks.filter((c) => c.status === "warn").length,
    failed: checks.filter((c) => c.status === "fail").length,
    total: checks.length,
  };
}

function addCheck(
  checks: Check[],
  id: string,
  category: string,
  name: string,
  status: CheckStatus,
  message: string
) {
  checks.push({ id, category, name, status, message });
}

// Only reads direct children of parent — avoids picking up episode <title> as channel <title>
function getDirectChildText(parent: XmlElement, tagName: string): string {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i] as XmlElement;
    if (node.nodeType === 1 && node.tagName === tagName) {
      return node.textContent?.trim() ?? "";
    }
  }
  return "";
}

function getTagText(doc: XmlDocument, tagName: string): string {
  return doc.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? "";
}

function getTagAttr(doc: XmlDocument, tagName: string, attr: string): string {
  return doc.getElementsByTagName(tagName)[0]?.getAttribute(attr) ?? "";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  const checks: Check[] = [];
  const startTime = Date.now();

  // ── 1. Feed Accessibility ──────────────────────────────────────────────
  let feedText: string;
  let statusCode: number;
  let contentType: string;
  let responseTimeMs: number;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const feedRes = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "FreedomPodcasting-FeedValidator/1.0" },
    });
    clearTimeout(timeout);
    responseTimeMs = Date.now() - startTime;
    statusCode = feedRes.status;
    contentType = feedRes.headers.get("content-type") ?? "";
    feedText = await feedRes.text();

    addCheck(
      checks, "http-status", "Feed Accessibility", "HTTP Status Code",
      statusCode === 200 ? "pass" : "fail",
      statusCode === 200
        ? `Feed returned HTTP ${statusCode}`
        : `Feed returned HTTP ${statusCode} — must be 200 OK`
    );

    addCheck(
      checks, "response-time", "Technical", "Response Time",
      responseTimeMs < 5000 ? "pass" : "warn",
      responseTimeMs < 5000
        ? `${responseTimeMs}ms`
        : `${responseTimeMs}ms — exceeds the 5 second recommendation`
    );
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    addCheck(
      checks, "http-status", "Feed Accessibility", "HTTP Status Code", "fail",
      isTimeout
        ? "Feed timed out after 8 seconds — check your hosting"
        : `Could not fetch feed: ${err instanceof Error ? err.message : "unknown error"}`
    );
    return NextResponse.json({ summary: buildSummary(checks), checks });
  }

  // ── 2. Content-Type ────────────────────────────────────────────────────
  const isXmlContentType = /xml|rss|atom/i.test(contentType);
  addCheck(
    checks, "content-type", "Feed Accessibility", "Content-Type Header",
    isXmlContentType ? "pass" : "warn",
    isXmlContentType
      ? contentType.split(";")[0].trim()
      : `"${contentType.split(";")[0].trim()}" — expected an XML variant (e.g. application/rss+xml)`
  );

  // ── 3. Feed Size ───────────────────────────────────────────────────────
  if (feedText.length > 5_000_000) {
    addCheck(
      checks, "feed-size", "Technical", "Feed Size",
      "warn",
      `Feed is ${(feedText.length / 1_000_000).toFixed(1)}MB — very large feeds may cause issues with some directories`
    );
  }

  // ── 4. XML Parsing ─────────────────────────────────────────────────────
  let doc: XmlDocument;
  let parseErrors = false;

  try {
    const parser = new DOMParser({
      errorHandler: (level: string, msg: string) => {
        if (level === "error" || level === "fatalError") {
          parseErrors = true;
        }
        void msg;
      },
    });
    doc = parser.parseFromString(feedText, "text/xml") as XmlDocument;
    addCheck(
      checks, "xml-parse", "Feed Accessibility", "XML Well-formed",
      parseErrors ? "fail" : "pass",
      parseErrors
        ? "Feed XML has parse errors — check for unescaped characters like &, <, >"
        : "Valid, well-formed XML"
    );
  } catch {
    addCheck(checks, "xml-parse", "Feed Accessibility", "XML Well-formed", "fail", "Could not parse feed as XML");
    return NextResponse.json({ summary: buildSummary(checks), checks });
  }

  // ── 5. Channel element ─────────────────────────────────────────────────
  const channel = doc.getElementsByTagName("channel")[0] as XmlElement | undefined;
  if (!channel) {
    addCheck(checks, "channel", "Channel Required Fields", "Channel Element", "fail", "No <channel> element found — this may not be a valid RSS feed");
    return NextResponse.json({ summary: buildSummary(checks), checks });
  }

  // ── 6. Channel Required Fields ─────────────────────────────────────────
  const channelTitle = getDirectChildText(channel, "title");
  addCheck(
    checks, "ch-title", "Channel Required Fields", "Channel Title",
    channelTitle ? "pass" : "fail",
    channelTitle ? `"${channelTitle.slice(0, 80)}"` : "<title> is missing or empty"
  );

  const channelLink = getDirectChildText(channel, "link");
  addCheck(
    checks, "ch-link", "Channel Required Fields", "Channel Link",
    channelLink ? "pass" : "warn",
    channelLink ? channelLink : "<link> is missing — recommended for directory listings"
  );

  const channelDesc = getDirectChildText(channel, "description");
  addCheck(
    checks, "ch-desc", "Channel Required Fields", "Channel Description",
    channelDesc ? "pass" : "fail",
    channelDesc ? "Present" : "<description> is missing or empty"
  );

  const lang = getDirectChildText(channel, "language");
  const validLang = /^[a-z]{2}(-[A-Z]{2})?$/.test(lang);
  addCheck(
    checks, "ch-lang", "Channel Required Fields", "Language",
    lang && validLang ? "pass" : lang ? "warn" : "fail",
    lang
      ? validLang ? `"${lang}"` : `"${lang}" — use format like "en" or "en-US"`
      : "<language> is missing — required by Apple Podcasts"
  );

  // ── 7. iTunes Required Fields ──────────────────────────────────────────
  const itunesImage = getTagAttr(doc, "itunes:image", "href");
  addCheck(
    checks, "it-image", "iTunes Required Fields", "iTunes Artwork Image",
    itunesImage ? "pass" : "fail",
    itunesImage
      ? itunesImage.length > 80 ? itunesImage.slice(0, 80) + "…" : itunesImage
      : "<itunes:image href> is missing — required by Apple Podcasts"
  );

  const itunesAuthor = getTagText(doc, "itunes:author");
  addCheck(
    checks, "it-author", "iTunes Required Fields", "iTunes Author",
    itunesAuthor ? "pass" : "fail",
    itunesAuthor ? `"${itunesAuthor}"` : "<itunes:author> is missing"
  );

  const itunesOwnerEl = doc.getElementsByTagName("itunes:owner")[0] as XmlElement | undefined;
  const itunesEmail = itunesOwnerEl
    ? (itunesOwnerEl.getElementsByTagName("itunes:email")[0]?.textContent?.trim() ?? "")
    : "";
  addCheck(
    checks, "it-owner", "iTunes Required Fields", "iTunes Owner & Email",
    itunesOwnerEl && itunesEmail ? "pass" : itunesOwnerEl ? "warn" : "fail",
    itunesOwnerEl && itunesEmail
      ? `Owner present, email: ${itunesEmail}`
      : itunesOwnerEl
      ? "<itunes:owner> present but <itunes:email> is missing"
      : "<itunes:owner> is missing — required for Apple Podcasts submission"
  );

  const itunesCategory = doc.getElementsByTagName("itunes:category")[0]?.getAttribute("text") ?? "";
  addCheck(
    checks, "it-category", "iTunes Required Fields", "iTunes Category",
    itunesCategory ? "pass" : "fail",
    itunesCategory ? `"${itunesCategory}"` : "<itunes:category> is missing — required for directory browsing"
  );

  // ── 8. Image Validation ────────────────────────────────────────────────
  if (itunesImage) {
    try {
      const imgRes = await fetch(itunesImage, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      const imgType = imgRes.headers.get("content-type") ?? "";
      const isJpgPng = /jpeg|jpg|png/i.test(imgType);

      addCheck(
        checks, "img-access", "Image Validation", "Artwork Accessible",
        imgRes.ok ? "pass" : "fail",
        imgRes.ok ? `HTTP ${imgRes.status}` : `Artwork returned HTTP ${imgRes.status}`
      );
      addCheck(
        checks, "img-type", "Image Validation", "Artwork Format",
        isJpgPng ? "pass" : "warn",
        isJpgPng
          ? imgType.split(";")[0].trim()
          : `"${imgType.split(";")[0].trim()}" — Apple Podcasts requires JPEG or PNG`
      );
    } catch {
      addCheck(checks, "img-access", "Image Validation", "Artwork Accessible", "warn", "Could not verify artwork URL within timeout");
    }
  }

  // ── 9. Technical Checks ────────────────────────────────────────────────
  const isHttps = url.startsWith("https://");
  addCheck(
    checks, "https", "Technical", "Feed Uses HTTPS",
    isHttps ? "pass" : "warn",
    isHttps ? "Feed URL uses HTTPS" : "Feed URL uses HTTP — Apple Podcasts requires HTTPS"
  );

  const atomLinks = doc.getElementsByTagName("atom:link");
  let hasSelfLink = false;
  for (let i = 0; i < atomLinks.length; i++) {
    if ((atomLinks[i] as XmlElement).getAttribute("rel") === "self") {
      hasSelfLink = true;
      break;
    }
  }
  addCheck(
    checks, "atom-self", "Technical", "atom:link rel=self",
    hasSelfLink ? "pass" : "warn",
    hasSelfLink
      ? "Present — helps directories track feed moves"
      : "<atom:link rel='self'> is missing — recommended for feed portability"
  );

  // ── 10. Episode Validation ─────────────────────────────────────────────
  const items = channel.getElementsByTagName("item");
  const itemCount = items.length;
  const seenGuids = new Set<string>();
  const dupGuids: string[] = [];
  let episodeIssues = 0;

  if (itemCount === 0) {
    addCheck(checks, "ep-count", "Episode Validation", "Episode Count", "warn", "Feed has no episodes yet");
  }

  for (let i = 0; i < Math.min(itemCount, 10); i++) {
    const item = items[i] as XmlElement;
    const itemTitle = item.getElementsByTagName("title")[0]?.textContent?.trim() ?? "";
    const enclosure = item.getElementsByTagName("enclosure")[0] as XmlElement | undefined;
    const guid = item.getElementsByTagName("guid")[0]?.textContent?.trim() ?? "";
    const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent?.trim() ?? "";

    if (!itemTitle) {
      addCheck(checks, `ep-title-${i}`, "Episode Validation", `Episode ${i + 1}: Title`, "fail", "Missing <title>");
      episodeIssues++;
    }

    if (!enclosure) {
      addCheck(checks, `ep-enc-${i}`, "Episode Validation", `Episode ${i + 1}: Enclosure`, "fail", "Missing <enclosure> — no audio file specified");
      episodeIssues++;
    } else {
      const encUrl = enclosure.getAttribute("url") ?? "";
      const encLen = enclosure.getAttribute("length") ?? "";
      const encType = enclosure.getAttribute("type") ?? "";
      const missing = [!encUrl && "url", !encLen && "length", !encType && "type"].filter(Boolean);
      if (missing.length > 0) {
        addCheck(checks, `ep-enc-${i}`, "Episode Validation", `Episode ${i + 1}: Enclosure`, "warn", `Missing enclosure attributes: ${missing.join(", ")}`);
        episodeIssues++;
      }

      // Check first episode's audio URL
      if (i === 0 && encUrl) {
        try {
          const audioRes = await fetch(encUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });
          addCheck(
            checks, "ep-audio", "Episode Validation", "Episode 1 Audio Accessible",
            audioRes.ok ? "pass" : "fail",
            audioRes.ok ? `HTTP ${audioRes.status}` : `Audio file returned HTTP ${audioRes.status}`
          );
        } catch {
          addCheck(checks, "ep-audio", "Episode Validation", "Episode 1 Audio Accessible", "warn", "Could not verify audio URL within timeout");
        }
      }
    }

    if (!guid) {
      addCheck(checks, `ep-guid-${i}`, "Episode Validation", `Episode ${i + 1}: GUID`, "fail", "Missing <guid> — each episode needs a unique identifier");
      episodeIssues++;
    } else {
      if (seenGuids.has(guid)) dupGuids.push(guid);
      seenGuids.add(guid);
    }

    if (pubDate) {
      const parsed = new Date(pubDate);
      if (isNaN(parsed.getTime())) {
        addCheck(checks, `ep-date-${i}`, "Episode Validation", `Episode ${i + 1}: pubDate`, "warn", `"${pubDate}" is not a valid RFC 2822 date`);
      }
    }
  }

  if (dupGuids.length > 0) {
    addCheck(checks, "dup-guids", "Episode Validation", "Duplicate GUIDs", "fail", `Found ${dupGuids.length} duplicate GUID(s) — each episode must have a unique GUID`);
  } else if (itemCount > 0 && episodeIssues === 0) {
    addCheck(checks, "ep-summary", "Episode Validation", `Episodes Checked (${Math.min(itemCount, 10)} of ${itemCount})`, "pass", `No issues found in first ${Math.min(itemCount, 10)} episodes`);
  }

  // ── Build response ─────────────────────────────────────────────────────
  return NextResponse.json({
    summary: buildSummary(checks),
    feedTitle: channelTitle,
    feedDescription: channelDesc ? channelDesc.slice(0, 200) : undefined,
    episodeCount: itemCount,
    responseTimeMs: responseTimeMs!,
    checks,
  });
}
