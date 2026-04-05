import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// next/image requires a Next.js server context — render nothing in tests
vi.mock("next/image", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  try { localStorage.clear(); } catch { /* jsdom may not always expose clear */ }
});

// jsdom does not implement the Clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});

// jsdom throws on window.location.href assignment
Object.defineProperty(window, "location", {
  value: { href: "" },
  writable: true,
});
