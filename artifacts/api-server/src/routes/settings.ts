import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { UpdateSettingsBody } from "@workspace/api-zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = join(__dirname, "../../data.json");

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "0710";

export const DEFAULT_SETTINGS = {
  pageTitle: "마시떡 AK플라자 수원점 팝업 EVENT",
  pageSubtitle: "QR 찍고 원하는 이벤트 하나만 참여하면 OK!",
  heroBadge: "증정 떡 1개 무료 증정",
  dateRange: "7.10(금) - 7.23(목)",
  noticeTitle: "오늘의 공지",
  noticeBody:
    "현재 이벤트 진행 중입니다.\n아래 중 하나만 참여하신 뒤 완료 화면을 직원에게 보여주세요.\n증정 떡은 현장 상황에 따라 변경되거나 조기 소진될 수 있습니다.",
  eventStatus: "진행 중",
  highlightMessage:
    "현재는 카카오톡 채널추가 또는 네이버 저장·알림받기 참여를 추천드립니다.",
  step1: "원하는 이벤트 선택",
  step2: "팔로우/저장 참여",
  step3: "완료 화면 직원 확인",
  step4: "증정 떡 1개 받기",
  fastParticipationNote:
    "빠른 참여를 원하시면?\n카카오톡 채널추가 또는 네이버 저장·알림받기가 가장 빠릅니다.",
  channelOrder: ["instagram", "naver", "kakao", "youtube"],
  buttons: [
    {
      id: "instagram",
      label: "인스타그램 팔로우하기",
      description: "마시떡 인스타그램을 팔로우하고 완료 화면을 보여주세요.",
      url: "https://www.instagram.com/masidduck/",
      visible: true,
    },
    {
      id: "naver",
      label: "네이버 저장·알림받기",
      description: "마시떡 네이버 플레이스를 저장하고 소식을 받아보세요.",
      url: "https://map.naver.com/p/search/%EB%A7%88%EC%8B%9C%EB%96%A1/place/1498829262?placePath=%2Fhome%3FabtExp%3DNEW-PLACE-SEARCH%3A1%26bk_query%3D%EB%A7%88%EC%8B%9C%EB%96%A1%26entry%3Dpll%26from%3Dnx%26fromNxList%3Dtrue%26from%3Dmap%26fromPanelNum%3D2%26timestamp%3D202607062303%26locale%3Dko%26svcName%3Dmap_pcv5%26searchText%3D%EB%A7%88%EC%8B%9C%EB%96%A1&bk_query=%EB%A7%88%EC%8B%9C%EB%96%A1&entry=pll&from=nx&fromNxList=true&searchType=place&c=15.00,0,0,0,dh",
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
      id: "youtube",
      label: "유튜브 구독하기",
      description: "마시떡 유튜브 채널을 구독하고 완료 화면을 보여주세요.",
      url: "https://www.youtube.com/@%EB%A7%88%EC%8B%9C%EB%96%A1",
      visible: true,
    },
  ],
};

export function readSettings() {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = readFileSync(DATA_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: typeof DEFAULT_SETTINGS) {
  writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

export { ADMIN_PASSWORD };

const router = Router();

router.get("/settings", (_req, res) => {
  const settings = readSettings();
  res.json(settings);
});

router.post("/settings", (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "잘못된 입력입니다." });
    return;
  }

  const { password, ...rest } = parsed.data;

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
    return;
  }

  const current = readSettings();
  const newSettings = { ...current, ...rest };
  writeSettings(newSettings);
  req.log.info({ eventStatus: newSettings.eventStatus }, "Settings updated by admin");
  res.json(newSettings);
});

export default router;
