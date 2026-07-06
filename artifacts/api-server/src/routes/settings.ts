import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { UpdateSettingsBody } from "@workspace/api-zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = join(__dirname, "../../data.json");

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "0710";

const DEFAULT_SETTINGS = {
  noticeTitle: "오늘의 공지",
  noticeBody:
    "현재 이벤트 진행 중입니다.\n아래 중 하나만 참여하신 뒤 완료 화면을 직원에게 보여주세요.\n증정 떡은 현장 상황에 따라 변경되거나 조기 소진될 수 있습니다.",
  eventStatus: "진행 중",
  highlightMessage:
    "현재는 카카오톡 채널추가 또는 네이버 저장·알림받기 참여를 추천드립니다.",
  showInstagram: true,
  showNaver: true,
  showKakao: true,
  showYoutube: true,
};

function readSettings() {
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

function writeSettings(settings: typeof DEFAULT_SETTINGS) {
  writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

const router = Router();

router.get("/settings", (req, res) => {
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

  const newSettings = {
    noticeTitle: rest.noticeTitle,
    noticeBody: rest.noticeBody,
    eventStatus: rest.eventStatus as string,
    highlightMessage: rest.highlightMessage,
    showInstagram: rest.showInstagram,
    showNaver: rest.showNaver,
    showKakao: rest.showKakao,
    showYoutube: rest.showYoutube,
  };

  writeSettings(newSettings);
  req.log.info({ eventStatus: newSettings.eventStatus }, "Settings updated by admin");
  res.json(newSettings);
});

export default router;
