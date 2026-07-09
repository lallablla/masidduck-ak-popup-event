import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const REDIS_KEY = "masidduck:analytics";

type ChannelEntry = { clicks: number; dwellMsTotal: number; dwellCount: number };
type Store = { pageViews: number; channels: Record<string, ChannelEntry> };

const EMPTY: Store = { pageViews: 0, channels: {} };

function getRedis() {
  return new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"]!,
    token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { type, channel, dwellMs } = req.body ?? {};

  try {
    const redis = getRedis();
    const store: Store = { ...EMPTY, ...((await redis.get<Store>(REDIS_KEY)) ?? {}) };

    if (type === "pageview") {
      store.pageViews += 1;
    } else if (type === "click" && channel) {
      if (!store.channels[channel]) {
        store.channels[channel] = { clicks: 0, dwellMsTotal: 0, dwellCount: 0 };
      }
      store.channels[channel].clicks += 1;
      if (typeof dwellMs === "number" && dwellMs > 0) {
        store.channels[channel].dwellMsTotal += dwellMs;
        store.channels[channel].dwellCount += 1;
      }
    }

    await redis.set(REDIS_KEY, store);
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
}
