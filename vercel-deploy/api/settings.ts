import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const REDIS_KEY = "masidduck:settings";
const SETTINGS_VERSION = 2;
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "0710";

const DEFAULT_SETTINGS = {
  pageTitle: "마시떡 AK플라자 수원점 팝업 EVENT",
  dateRange: "7.10(금) - 7.23(목)",
  noticeTitle: "오늘의 공지",
  noticeBody:
    "현재 전체 이벤트 진행 중입니다.\n인스타 인증 또는 빠른 참여 중 원하시는 이벤트에 참여해주세요.\n참여 완료 화면을 직원에게 보여주시면 증정품을 드립니다.",
  eventStatus: "전체 이벤트 진행 중",
  highlightMessage:
    "현재는 인스타 인증 이벤트와\n빠른 참여 이벤트를(약과증정) 동시 진행 중입니다.",
  mainEventActive: true,
  mainEventBenefit: "둘이 먹다 하나가 없어져도 모를 약과 1개 현장 증정!",
  mainEventTitle: "인스타 인증하고\n약과 1개 받아가세요!",
  mainEventDescription:
    "마시떡 인스타그램을 팔로우하고\n팝업 현장 사진 또는 피자설기 사진을 올려주세요.\n참여 완료 화면을 직원에게 보여주시면 약과 1개를 드립니다.",
  mainEventHashtagsRequired: ["@masidduck", "#피자설기", "#AK수원팝업"],
  mainEventHashtagsRecommended: [
    "#수원맛집",
    "#수원디저트",
    "#아이간식",
    "#쌀디저트",
    "#K디저트",
    "#이색디저트",
  ],
  subEventActive: true,
  subEventBenefit: "증정떡 1개",
  subEventTitle: "빠른 참여도 OK!",
  subEventDescription:
    "아래 중 하나만 참여해도 증정 혜택을 드려요.\n카카오톡 채널추가, 네이버 저장·알림받기, 유튜브 구독 중 하나를 선택하세요.",
  plusEventActive: true,
  plusEventBenefit: "피자설기 8개입 자택 배송",
  plusEventTitle: "PLUS EVENT — 베스트 리뷰 선정",
  plusEventDescription:
    "인스타 인증 이벤트 참여자 중\n정성스러운 사진과 후기를 남겨주신 분께\n팝업 종료 후 피자설기 8개입을 보내드립니다.\n\n선정되신 분께는 팝업 종료 후 인스타그램 DM으로 개별 연락드립니다.",
  channelOrder: ["instagram", "kakao", "naver", "youtube"],
  buttons: [
    {
      id: "instagram",
      label: "인스타그램 팔로우하기",
      description: "팔로우 후 현장 사진과 태그를 업로드해주세요.",
      url: "https://www.instagram.com/masidduck/",
      visible: true,
    },
    {
      id: "kakao",
      label: "카카오톡 채널추가하기",
      description: "마시떡 카카오톡 채널을 추가하고 완료 화면을 보여주세요.",
      url: "https://pf.kakao.com/_HxbfJn",
      visible: true,
    },
    {
      id: "naver",
      label: "네이버 저장·알림받기",
      description: "마시떡 네이버 플레이스를 저장하고 소식을 받아보세요.",
      url: "https://map.naver.com/p/search/%EB%A7%88%EC%8B%9C%EB%96%A1/place/1498829262",
      visible: true,
    },
    {
      id: "youtube",
      label: "유튜브 구독하기",
      description: "마시떡 유튜브 채널을 구독하고 완료 화면을 보여주세요.",
      url: "https://www.youtube.com/@%EB%A7%88%EC%8B%9C%EB%96%A1",
      visible: true,
    },
  ],
};

function getRedis() {
  return new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"]!,
    token: process.env["UPSTASH_REDIS_REST_TOKEN"]!,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const redis = getRedis();
      const stored = await redis.get<any>(REDIS_KEY);
      if (!stored || (stored._version ?? 0) < SETTINGS_VERSION) {
        const fresh = { ...DEFAULT_SETTINGS, _version: SETTINGS_VERSION };
        await redis.set(REDIS_KEY, fresh);
        res.json(fresh);
      } else {
        res.json({ ...DEFAULT_SETTINGS, ...stored });
      }
    } catch {
      res.json(DEFAULT_SETTINGS);
    }
    return;
  }

  if (req.method === "POST") {
    const body = req.body ?? {};
    const { password, ...rest } = body;

    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
      return;
    }

    try {
      const redis = getRedis();
      const stored = await redis.get<object>(REDIS_KEY);
      const newSettings = { ...DEFAULT_SETTINGS, ...(stored ?? {}), ...rest, _version: SETTINGS_VERSION };
      await redis.set(REDIS_KEY, newSettings);
      res.json(newSettings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
