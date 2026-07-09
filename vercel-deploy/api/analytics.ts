import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const REDIS_KEY = "masidduck:analytics";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "0710";

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

  const { password } = req.body ?? {};

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
    return;
  }

  try {
    const redis = getRedis();
    const store: Store = { ...EMPTY, ...((await redis.get<Store>(REDIS_KEY)) ?? {}) };

    const totalClicks = Object.values(store.channels).reduce((s, ch) => s + ch.clicks, 0);
    const channelStats: Record<string, { clicks: number; avgDwellMs: number }> = {};
    for (const [id, ch] of Object.entries(store.channels)) {
      channelStats[id] = {
        clicks: ch.clicks,
        avgDwellMs: ch.dwellCount > 0 ? Math.round(ch.dwellMsTotal / ch.dwellCount) : 0,
      };
    }

    res.json({ pageViews: store.pageViews, totalClicks, channelStats });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
