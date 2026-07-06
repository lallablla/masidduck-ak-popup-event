import React from "react";
import { useGetSettings } from "@workspace/api-client-react";
import { SiInstagram, SiNaver, SiKakaotalk, SiYoutube } from "react-icons/si";
import { AdminPanel } from "@/components/AdminPanel";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { data: settings, isLoading } = useGetSettings();

  const isHalted = settings?.eventStatus === "일시 중단" || settings?.eventStatus === "증정품 소진";

  return (
    <div className="min-h-[100dvh] w-full max-w-[480px] mx-auto bg-background shadow-2xl overflow-hidden relative">
      
      {/* Header / Hero */}
      <header className="px-6 pt-12 pb-8 text-center bg-card rounded-b-[2.5rem] shadow-sm relative z-10">
        <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
          7.10(금) - 7.23(목)
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight mb-3">
          마시떡 AK플라자<br/>수원점 팝업 EVENT
        </h1>
        <p className="text-muted-foreground text-sm font-medium mb-6">
          QR 찍고 원하는 이벤트 하나만 참여하면 OK!
        </p>
        <div className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-md shadow-primary/20">
          증정 떡 1개 무료 증정
        </div>
      </header>

      <main className="px-5 py-8 space-y-8">
        
        {/* Notice Section */}
        {isLoading ? (
          <div className="animate-pulse bg-muted rounded-2xl h-32 w-full"></div>
        ) : settings ? (
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
        ) : null}

        {/* Steps */}
        <section>
          <h2 className="text-xl font-bold mb-4 px-1 text-foreground">참여 방법</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { step: 1, text: "원하는 이벤트 선택" },
              { step: 2, text: "팔로우/저장 참여" },
              { step: 3, text: "완료 화면 직원 확인" },
              { step: 4, text: "증정 떡 1개 받기" },
            ].map((s) => (
              <div key={s.step} className="bg-secondary/50 p-4 rounded-2xl flex flex-col items-start gap-2 border border-border/50">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">STEP {s.step}</span>
                <span className="text-sm font-semibold text-secondary-foreground leading-snug">{s.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Event Buttons */}
        {settings && !isHalted && (
          <section className="space-y-4">
            {settings.showInstagram && (
              <a 
                href="https://www.instagram.com/masidduck/" 
                target="_blank" 
                rel="noreferrer"
                data-testid="button-instagram"
                className="flex items-center p-4 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/30 transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <SiInstagram className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-base text-foreground mb-0.5 group-hover:text-primary transition-colors">인스타그램 팔로우하기</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">마시떡 팔로우하고 보여주세요</p>
                </div>
              </a>
            )}

            {settings.showNaver && (
              <a 
                href="https://map.naver.com/p/search/%EB%A7%88%EC%8B%9C%EB%96%A1/place/1498829262" 
                target="_blank" 
                rel="noreferrer"
                data-testid="button-naver"
                className="flex items-center p-4 rounded-2xl bg-card border border-border shadow-sm hover:border-[#03C75A]/30 transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#03C75A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#03C75A]/20">
                  <SiNaver className="w-5 h-5" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-base text-foreground mb-0.5 group-hover:text-[#03C75A] transition-colors">네이버 저장·알림받기</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">장소 저장하고 소식 받기</p>
                </div>
              </a>
            )}

            {settings.showKakao && (
              <a 
                href="https://pf.kakao.com/_HxbfJn" 
                target="_blank" 
                rel="noreferrer"
                data-testid="button-kakao"
                className="flex items-center p-4 rounded-2xl bg-card border border-border shadow-sm hover:border-[#FEE500]/50 transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FEE500] text-[#000000] flex items-center justify-center shrink-0 shadow-md shadow-[#FEE500]/20">
                  <SiKakaotalk className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-base text-foreground mb-0.5 group-hover:text-[#3C1E1E] transition-colors">카카오톡 채널추가하기</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">채널 추가하고 보여주세요</p>
                </div>
              </a>
            )}

            {settings.showYoutube && (
              <a 
                href="https://www.youtube.com/@%EB%A7%88%EC%8B%9C%EB%96%A1" 
                target="_blank" 
                rel="noreferrer"
                data-testid="button-youtube"
                className="flex items-center p-4 rounded-2xl bg-card border border-border shadow-sm hover:border-[#FF0000]/30 transition-all active:scale-[0.98] group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF0000]/20">
                  <SiYoutube className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-base text-foreground mb-0.5 group-hover:text-[#FF0000] transition-colors">유튜브 구독하기</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">채널 구독하고 보여주세요</p>
                </div>
              </a>
            )}
          </section>
        )}

        {/* Fast Participation Banner */}
        <div className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/10">
          <p className="text-sm font-semibold text-primary/80">
            빠른 참여를 원하시면?
            <br/>
            <span className="text-primary font-bold">카카오톡 채널추가</span> 또는 <span className="text-primary font-bold">네이버 저장·알림받기</span>가 가장 빠릅니다.
          </p>
        </div>

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

      <AdminPanel />
    </div>
  );
}
