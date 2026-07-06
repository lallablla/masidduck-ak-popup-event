import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { TrackEventBody, GetAnalyticsBody } from "@workspace/api-zod";
import { ADMIN_PASSWORD } from "./settings";

const ANALYTICS_FILE = join(process.cwd(), "analytics.json");

type ChannelEntry = {
  clicks: number;
  dwellMsTotal: number;
  dwellCount: number;
};

type AnalyticsStore = {
  pageViews: number;
  channels: Record<string, ChannelEntry>;
};

const EMPTY_STORE: AnalyticsStore = {
  pageViews: 0,
  channels: {},
};

function readStore(): AnalyticsStore {
  if (!existsSync(ANALYTICS_FILE)) return { ...EMPTY_STORE };
  try {
    const raw = readFileSync(ANALYTICS_FILE, "utf-8");
    return { ...EMPTY_STORE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STORE };
  }
}

function writeStore(store: AnalyticsStore) {
  writeFileSync(ANALYTICS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

const router = Router();

router.post("/analytics/track", (req, res) => {
  const parsed = TrackEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "잘못된 입력입니다." });
    return;
  }

  const { type, channel, dwellMs } = parsed.data;
  const store = readStore();

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

  writeStore(store);
  res.json({ ok: true });
});

router.post("/analytics", (req, res) => {
  const parsed = GetAnalyticsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "잘못된 입력입니다." });
    return;
  }

  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
    return;
  }

  const store = readStore();
  const totalClicks = Object.values(store.channels).reduce(
    (sum, ch) => sum + ch.clicks,
    0
  );

  const channelStats: Record<string, { clicks: number; avgDwellMs: number }> = {};
  for (const [id, ch] of Object.entries(store.channels)) {
    channelStats[id] = {
      clicks: ch.clicks,
      avgDwellMs: ch.dwellCount > 0 ? Math.round(ch.dwellMsTotal / ch.dwellCount) : 0,
    };
  }

  res.json({
    pageViews: store.pageViews,
    totalClicks,
    channelStats,
  });
});

export default router;
