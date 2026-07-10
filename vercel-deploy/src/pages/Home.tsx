import { useEffect, useRef } from "react";
import { useGetSettings, useTrackEvent } from "@/lib/api";
import { SiInstagram, SiNaver, SiKakaotalk, SiYoutube } from "react-icons/si";
import { AdminPanel } from "@/components/AdminPanel";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type ChannelButton = {
  id: "instagram" | "naver" | "kakao" | "youtube";
  label: string;
  description: string;
  url: string;
  visible: boolean;
};

const CHANNEL_ICONS: Record<string, { icon: React.ComponentType<{className?: string}>, bg: string, color: string }> = {
  instagram: { icon: SiInstagram, bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500", color: "text-white" },
  naver: { icon: SiNaver, bg: "bg-[#03C75A]", color: "text-white" },
  kakao: { icon: SiKakaotalk, bg: "bg-[#FEE500]", color: "text-black" },
  youtube: { icon: SiYoutube, bg: "bg-[#FF0000]", color: "text-white" },
};

const DEFAULT_SETTINGS = {
  pageTitle: "마시떡 AK플라자 수원점 팝업 EVENT",
  dateRange: "7.10(금) - 7.23(목)",
  noticeTitle: "오늘의 공지",
  noticeBody:
    "현재 전체 이벤트 진행 중입니다.\n인스타 인증 또는 빠른 참여 중 원하시는 이벤트에 참여해주세요.\n참여 완료 화면을 직원에게 보여주시면 증정품을 드립니다.",
  eventStatus: "전체 이벤트 진행 중",
  highlightMessage:
    "현재는 인스타 인증 이벤트(약과 증정)와 빠른 참여 이벤트를 동시 진행 중입니다.",
  mainEventActive: true,
  mainEventBenefit: "둘이 먹다 하나가 없어져도 모를 약과 1개 현장 증정!",
  mainEventTitle: "인스타 인증하고\n약과 1개 받아가세요!",
  mainEventDescription:
    "마시떡 인스타그램을 팔로우하고\n팝업 현장 사진 또는 약과 사진을 올려주세요.\n참여 완료 화면을 직원에게 보여주시면 약과 1개를 드립니다.",
  mainEventHashtagsRequired: ["@masidduck", "#약과", "#AK수원팝업"],
  mainEventHashtagsRecommended: [
    "#수원맛집", "#수원디저트", "#아이간식", "#쌀디저트", "#K디저트", "#이색디저트",
  ],
  subEventActive: true,
  subEventBenefit: "약과 1개 증정",
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

export default function Home() {
  const { data: apiSettings } = useGetSettings();
  const trackEvent = useTrackEvent();
  const pageLoadTimeRef = useRef<number>(Date.now());
  const { toast } = useToast();

  const settings = apiSettings ?? DEFAULT_SETTINGS;

  useEffect(() => {
    pageLoadTimeRef.current = Date.now();
    trackEvent.mutate({ data: { type: "pageview" } });
  }, []);

  const handleChannelClick = (btn: ChannelButton) => {
    const dwellMs = Date.now() - pageLoadTimeRef.current;
    trackEvent.mutate({ data: { type: "click", channel: btn.id, dwellMs } });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: `${text} 가 클립보드에 복사되었습니다.`,
    });
  };

  const isAllRunning = settings.eventStatus === "전체 이벤트 진행 중";
  const isMainOnly = settings.eventStatus === "인스타 인증 이벤트만 진행 중";
  const isSubOnly = settings.eventStatus === "빠른 참여 이벤트만 진행 중";
  const isHalted = settings.eventStatus === "이벤트 일시 중단" || settings.eventStatus === "증정품 소진";

  const showMainEvent = !isHalted && (isAllRunning || isMainOnly) && settings.mainEventActive;
  const showSubEvent = !isHalted && (isAllRunning || isSubOnly) && settings.subEventActive;
  const showPlusEvent = !isHalted && (isAllRunning || isMainOnly) && settings.plusEventActive;

  let noticeBadgeColor = "bg-primary text-primary-foreground";
  if (isAllRunning) noticeBadgeColor = "bg-green-600 text-white";
  else if (isMainOnly) noticeBadgeColor = "bg-red-600 text-white";
  else if (isSubOnly) noticeBadgeColor = "bg-orange-500 text-white";
  else if (isHalted) noticeBadgeColor = "bg-neutral-500 text-white";

  const instagramBtn = settings.buttons.find((b: any) => b.id === "instagram");
  const otherBtns = (settings.channelOrder || [])
    .filter((id: string) => id !== "instagram")
    .map((id: string) => settings.buttons.find((b: any) => b.id === id))
    .filter((b: any) => b && b.visible);

  return (
    <div className="min-h-[100dvh] w-full max-w-[480px] mx-auto bg-background shadow-2xl overflow-hidden relative pb-16">
      <div className="sticky top-0 z-20 bg-neutral-900 text-white text-[11px] font-medium text-center py-2 px-4 leading-relaxed">
        💡 버튼 클릭 후 이 페이지로 돌아오려면 화면의 <span className="font-bold">뒤로가기(←)</span> 버튼을 눌러주세요.
      </div>
      <header className="px-6 pt-10 pb-8 text-center bg-card rounded-b-[2.5rem] shadow-sm relative z-10">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border border-neutral-100">
            <img src="/masidduck-logo.png" alt="마시떡" className="w-20 h-20 object-contain" />
          </div>
          <span className="text-lg font-light text-muted-foreground/40 select-none">×</span>
          <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden flex items-center justify-center bg-white border border-neutral-100">
            <img src="/ak-plaza-new.jpeg" alt="AK플라자" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="inline-flex items-center justify-center px-3 py-1 mb-3 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
          {settings.dateRange}
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug whitespace-pre-line">
          마시떡 × AK플라자 수원점{"\n"}팝업 이벤트
        </h1>
      </header>

      <main className="px-5 py-8 space-y-10">
        <div className="space-y-4">
          <Card className="border-primary/10 shadow-sm overflow-hidden bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${noticeBadgeColor}`}>
                  {settings.eventStatus}
                </span>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  {settings.noticeTitle}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {settings.noticeBody}
              </p>
              {settings.highlightMessage && (
                <div className="mt-4 p-3 bg-primary/5 rounded-xl text-primary text-sm font-semibold text-center break-keep leading-relaxed">
                  {settings.highlightMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showMainEvent && (
          <section className="bg-card rounded-3xl p-6 shadow-md border-2 border-red-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              인스타 인증 EVENT
            </div>
            <div className="mt-4 mb-6 text-center">
              <div className="inline-block bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full text-xs mb-3 border border-red-100">
                {settings.mainEventBenefit}
              </div>
              <h2 className="text-2xl font-black text-foreground whitespace-pre-line leading-tight">
                {settings.mainEventTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap leading-relaxed">
                {settings.mainEventDescription}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "마시떡 인스타그램 팔로우하기",
                "현장 사진 또는 약과 사진 업로드",
                "아래 필수 태그 추가",
                "완료 화면 직원에게 보여주기"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-secondary-foreground">{text}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-red-600">필수 태그</div>
                <button
                  onClick={() => copyToClipboard(settings.mainEventHashtagsRequired?.join(" ") ?? "")}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold active:scale-95 transition-transform shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  전체 복사
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.mainEventHashtagsRequired?.map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-semibold border border-red-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {settings.mainEventHashtagsRecommended?.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-bold text-muted-foreground mb-2">함께 달면 좋아요</div>
                <div className="flex flex-wrap gap-1.5">
                  {settings.mainEventHashtagsRecommended.map((tag: string) => (
                    <span key={tag} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {instagramBtn && instagramBtn.visible && (
              <a
                href={instagramBtn.url}
                rel="noopener"
                onClick={() => handleChannelClick(instagramBtn as ChannelButton)}
                className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
              >
                <SiInstagram className="w-6 h-6" />
                {instagramBtn.label}
              </a>
            )}
          </section>
        )}

        {showPlusEvent && (
          <section className="bg-amber-50/50 rounded-3xl p-6 border border-amber-200/50">
            <div className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              PLUS EVENT
            </div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">{settings.plusEventTitle}</h3>
            <div className="inline-block bg-white text-amber-600 font-bold px-2 py-1 rounded text-xs mb-3 shadow-sm">
              {settings.plusEventBenefit}
            </div>
            <p className="text-sm text-amber-900/80 whitespace-pre-wrap leading-relaxed mb-4">
              {settings.plusEventDescription}
            </p>
            <div className="bg-white/60 p-3 rounded-xl text-[11px] text-amber-900/70 space-y-1">
              <div>※ 계정이 비공개인 경우 확인이 어려울 수 있습니다.</div>
              <div>※ DM 미응답 시 선정이 취소될 수 있습니다.</div>
              <div>※ 당첨자 선정 및 배송 안내는 팝업 종료 후 개별 연락드립니다.</div>
            </div>
          </section>
        )}

        {showSubEvent && (
          <section className="bg-orange-50/30 rounded-3xl p-6 border border-orange-100">
            <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              빠른 참여 EVENT
            </div>
            <h3 className="text-lg font-bold text-orange-900 mb-2">{settings.subEventTitle}</h3>
            <div className="inline-block bg-white text-orange-600 font-bold px-2 py-1 rounded text-xs mb-3 shadow-sm">
              {settings.subEventBenefit}
            </div>
            <p className="text-sm text-orange-900/80 whitespace-pre-wrap leading-relaxed mb-5">
              {settings.subEventDescription}
            </p>
            <div className="space-y-3">
              {otherBtns.map((btn: any) => {
                if (!btn) return null;
                const iconData = CHANNEL_ICONS[btn.id];
                if (!iconData) return null;
                const IconComponent = iconData.icon;
                return (
                  <a
                    key={btn.id}
                    href={btn.url}
                    rel="noopener"
                    onClick={() => handleChannelClick(btn as ChannelButton)}
                    className="flex items-center p-3.5 rounded-2xl bg-white border border-orange-100 shadow-sm transition-all active:scale-[0.98] group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${iconData.bg} ${iconData.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-bold text-sm text-foreground mb-0.5 group-hover:text-orange-600 transition-colors">{btn.label}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{btn.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex items-center justify-center gap-6 py-2">
          <a href="https://masidduck-web.vercel.app/" rel="noopener" className="flex flex-col items-center gap-1 group">
            <div className="w-11 h-11 rounded-2xl bg-secondary/60 flex items-center justify-center group-active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <span className="text-[10px] text-muted-foreground/60">홈페이지</span>
          </a>
          <a href="https://smartstore.naver.com/masidduck" rel="noopener" className="flex flex-col items-center gap-1 group">
            <div className="w-11 h-11 rounded-2xl bg-[#03C75A]/10 flex items-center justify-center group-active:scale-95 transition-transform">
              <SiNaver className="w-5 h-5 text-[#03C75A]" />
            </div>
            <span className="text-[10px] text-muted-foreground/60">스마트스토어</span>
          </a>
        </div>

        <section className="bg-secondary/30 rounded-2xl p-5">
          <h5 className="text-xs font-bold text-muted-foreground mb-3">유의사항</h5>
          <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc pl-3">
            <li>이벤트는 1인 1회 참여 가능합니다.</li>
            <li>참여 완료 화면을 직원에게 보여주셔야 증정이 가능합니다.</li>
            <li>증정품은 현장 상황에 따라 변경되거나 조기 소진될 수 있습니다.</li>
            <li>이벤트 내용은 현장 상황에 따라 변경될 수 있습니다.</li>
          </ul>
        </section>
      </main>

      <AdminPanel />
    </div>
  );
}
