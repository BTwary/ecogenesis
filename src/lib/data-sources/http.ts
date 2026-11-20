import "server-only";
import https from "https";
import http from "http";

/**
 * Shared HTTP client for environmental data connectors.
 *
 * Implemented on Node's https module with IPv4 explicitly preferred because
 * this sandbox's IPv6 route to some providers stalls (undici's default
 * happy-eyeballs path was observed to ETIMEDOUT on a host where IPv4 works).
 * Provides timeouts, bounded exponential-backoff retries, redirects and JSON
 * parsing.
 */

export interface FetchOpts {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

interface RawResponse {
  status: number;
  statusText: string;
  headers: Record<string, string | string[] | undefined>;
  text: string;
}

function rawRequest(url: URL, headers: Record<string, string>, timeoutMs: number): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === "http:" ? http : https;
    const req = mod.request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": "ECOGENESIS/1.0 (environmental-education-platform)",
          Accept: "application/json",
          ...headers,
        },
        family: 4, // prefer IPv4 — IPv6 routes stall for some providers here
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            statusText: res.statusMessage ?? "",
            headers: res.headers,
            text: Buffer.concat(chunks).toString("utf8"),
          }),
        );
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error(`connect/read timeout after ${timeoutMs}ms`)));
    req.on("error", reject);
    req.end();
  });
}

export async function fetchJson<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const { timeoutMs = 15000, retries = 2, headers = {} } = opts;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let current = new URL(url);
      let res = await rawRequest(current, headers, timeoutMs);
      let redirects = 0;
      while ([301, 302, 307, 308].includes(res.status) && redirects < 3) {
        const loc = res.headers["location"];
        if (!loc || typeof loc !== "string") break;
        current = new URL(loc, current);
        res = await rawRequest(current, headers, timeoutMs);
        redirects += 1;
      }
      if (res.status >= 400) {
        throw new Error(`HTTP ${res.status} ${res.statusText || ""}${res.text ? `: ${res.text.slice(0, 180)}` : ""}`);
      }
      return JSON.parse(res.text) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 700 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError ?? new Error("fetch failed");
}
