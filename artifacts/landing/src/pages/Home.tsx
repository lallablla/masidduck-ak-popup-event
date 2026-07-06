import { useEffect, useRef } from "react";
import { useGetSettings, useTrackEvent } from "@workspace/api-client-react";
import { SiInstagram, SiNaver, SiKakaotalk, SiYoutube } from "react-icons/si";
import { AdminPanel } from "@/components/AdminPanel";
import { Card, CardContent } from "@/components/ui/card";

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

export default function Home() {
  const { data: settings, isLoading } = useGetSettings();
  const trackEvent = useTrackEvent();
  const pageLoadTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    pageLoadTimeRef.current = Date.now();
    trackEvent.mutate({ data: { type: "pageview" } });
  }, []);

  const handleChannelClick = (btn: ChannelButton, e: React.MouseEvent) => {
    e.preventDefault();
    const dwellMs = Date.now() - pageLoadTimeRef.current;
    trackEvent.mutate({ data: { type: "click", channel: btn.id, dwellMs } });
    window.open(btn.url, "_blank", "noreferrer");
  };

  const isHalted = settings?.eventStatus === "일시 중단" || settings?.eventStatus === "증정품 소진";

  return (
    <div className="min-h-[100dvh] w-full max-w-[480px] mx-auto bg-background shadow-2xl overflow-hidden relative pb-16">
      {settings ? (
        <>
          <header className="px-6 pt-12 pb-8 text-center bg-card rounded-b-[2.5rem] shadow-sm relative z-10">
            <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {settings.dateRange}
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight mb-3 whitespace-pre-line">
              {settings.pageTitle}
            </h1>
            <p className="text-muted-foreground text-sm font-medium mb-6">
              {settings.pageSubtitle}
            </p>
            <div className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-md shadow-primary/20">
              {settings.heroBadge}
            </div>
          </header>

          <main className="px-5 py-8 space-y-8">
            {/* Notice Section */}
            <div className="space-y-4">
              {isHalted && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl text-center font-bold text-lg">
                  {settings.eventStatus}
                </div>
              )}
              
              <Card className="border-primary/10 shadow-sm overflow-hidden bg-card">
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary block"></span>
                    {settings.noticeTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {settings.noticeBody}
                  </p>
                  {settings.highlightMessage && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-xl text-primary text-sm font-semibold text-center">
                      {settings.highlightMessage}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Steps */}
            <section>
              <h2 className="text-xl font-bold mb-4 px-1 text-foreground">참여 방법</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { step: 1, text: settings.step1 },
                  { step: 2, text: settings.step2 },
                  { step: 3, text: settings.step3 },
                  { step: 4, text: settings.step4 },
                ].map((s) => (
                  <div key={s.step} className="bg-secondary/50 p-4 rounded-2xl flex flex-col items-start gap-2 border border-border/50">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">STEP {s.step}</span>
                    <span className="text-sm font-semibold text-secondary-foreground leading-snug">{s.text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Event Buttons */}
            {!isHalted && settings.buttons && settings.channelOrder && (
              <section className="space-y-4">
                {settings.channelOrder.map((channelId) => {
                  const btn = settings.buttons.find((b: any) => b.id === channelId);
                  if (!btn || !btn.visible) return null;
                  
                  const iconData = CHANNEL_ICONS[btn.id];
                  if (!iconData) return null;
                  const IconComponent = iconData.icon;

                  return (
                    <a
                      key={btn.id}
                      href={btn.url}
                      onClick={(e) => handleChannelClick(btn as ChannelButton, e)}
                      data-testid={`button-${btn.id}`}
                      className="flex items-center p-4 rounded-2xl bg-card border border-border shadow-sm transition-all active:scale-[0.98] hover:border-primary/30 group"
                    >
                      <div className={`w-12 h-12 rounded-xl ${iconData.bg} ${iconData.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-base text-foreground mb-0.5 group-hover:text-primary transition-colors">{btn.label}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{btn.description}</p>
                      </div>
                    </a>
                  );
                })}
              </section>
            )}

            {/* Fast Participation Banner */}
            {settings.fastParticipationNote && (
              <div className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/10">
                <p className="text-sm font-semibold text-primary/80 whitespace-pre-wrap">
                  {settings.fastParticipationNote}
                </p>
              </div>
            )}

            {/* Notes */}
            <section className="bg-secondary/30 rounded-2xl p-5">
              <h5 className="text-xs font-bold text-muted-foreground mb-3">유의사항</h5>
              <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc pl-3">
                <li>이벤트는 1인 1회 참여 가능합니다.</li>
                <li>참여 완료 화면을 직원에게 보여주셔야 증정이 가능합니다.</li>
                <li>증정 떡은 현장 상황에 따라 변경되거나 조기 소진될 수 있습니다.</li>
                <li>이벤트 내용은 현장 상황에 따라 변경될 수 있습니다.</li>
              </ul>
            </section>
          </main>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          {isLoading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}
        </div>
      )}

      <AdminPanel />
    </div>
  );
}