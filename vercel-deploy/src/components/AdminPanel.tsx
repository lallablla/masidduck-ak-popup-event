import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey, useGetAnalytics } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { SiInstagram, SiNaver, SiKakaotalk, SiYoutube } from "react-icons/si";

const DEFAULT_SETTINGS = {
  pageTitle: "마시떡 AK플라자 수원점 팝업 EVENT",
  dateRange: "7.10(금) - 7.23(목)",
  noticeTitle: "오늘의 공지",
  noticeBody: "현재 전체 이벤트 진행 중입니다.\n인스타 인증 또는 빠른 참여 중 원하시는 이벤트에 참여해주세요.",
  eventStatus: "전체 이벤트 진행 중" as const,
  highlightMessage: "현재는 인스타 인증 이벤트(피자설기 증정)와 빠른 참여 이벤트를 동시 진행 중입니다.",
  mainEventActive: true,
  mainEventBenefit: "피자설기 1개 현장 증정",
  mainEventTitle: "인스타 인증하고\n피자설기 1개 받아가세요!",
  mainEventDescription: "마시떡 인스타그램을 팔로우하고\n팝업 현장 사진 또는 피자설기 사진을 올려주세요.\n참여 완료 화면을 직원에게 보여주시면 피자설기 1개를 드립니다.",
  mainEventHashtagsRequired: ["@masidduck", "#피자설기", "#AK수원팝업"],
  mainEventHashtagsRecommended: ["#수원맛집", "#수원디저트", "#아이간식", "#쌀디저트", "#K디저트", "#이색디저트"],
  subEventActive: true,
  subEventBenefit: "증정떡 1개",
  subEventTitle: "빠른 참여도 OK!",
  subEventDescription: "아래 중 하나만 참여해도 증정 혜택을 드려요.\n카카오톡 채널추가, 네이버 저장·알림받기, 유튜브 구독 중 하나를 선택하세요.",
  plusEventActive: true,
  plusEventBenefit: "피자설기 8개입 자택 배송",
  plusEventTitle: "PLUS EVENT — 베스트 리뷰 선정",
  plusEventDescription: "인스타 인증 이벤트 참여자 중\n정성스러운 사진과 후기를 남겨주신 분께\n팝업 종료 후 피자설기 8개입을 보내드립니다.\n\n선정되신 분께는 팝업 종료 후 인스타그램 DM으로 개별 연락드립니다.",
  channelOrder: ["instagram", "kakao", "naver", "youtube"],
  buttons: [
    { id: "instagram" as const, label: "인스타그램 팔로우하기", description: "팔로우 후 현장 사진과 태그를 업로드해주세요.", url: "https://www.instagram.com/masidduck/", visible: true },
    { id: "kakao" as const, label: "카카오톡 채널추가하기", description: "마시떡 카카오톡 채널을 추가하고 완료 화면을 보여주세요.", url: "https://pf.kakao.com/_HxbfJn", visible: true },
    { id: "naver" as const, label: "네이버 저장·알림받기", description: "마시떡 네이버 플레이스를 저장하고 소식을 받아보세요.", url: "https://map.naver.com/p/search/masidduck/place/1498829262", visible: true },
    { id: "youtube" as const, label: "유튜브 구독하기", description: "마시떡 유튜브 채널을 구독하고 완료 화면을 보여주세요.", url: "https://www.youtube.com/@마시떡", visible: true }
  ]
};

const CHANNEL_ICONS: Record<string, { icon: any, color: string }> = {
  instagram: { icon: SiInstagram, color: "text-pink-500" },
  naver: { icon: SiNaver, color: "text-[#03C75A]" },
  kakao: { icon: SiKakaotalk, color: "text-[#FEE500]" },
  youtube: { icon: SiYoutube, color: "text-[#FF0000]" },
};

function SortableChannelCard({ channelId, formData, setFormData }: { channelId: string, formData: any, setFormData: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: channelId });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const btn = formData.buttons.find((b: any) => b.id === channelId);
  if (!btn) return null;

  const iconData = CHANNEL_ICONS[btn.id];
  const IconComp = iconData?.icon;

  const updateBtn = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      buttons: prev.buttons.map((b: any) => b.id === channelId ? { ...b, [field]: value } : b)
    }));
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card p-4 rounded-xl border shadow-sm flex gap-3 items-start relative mb-3">
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            {IconComp && <IconComp className={`w-4 h-4 ${iconData.color}`} />}
            {btn.id.toUpperCase()}
          </div>
          <Switch checked={btn.visible} onCheckedChange={(c) => updateBtn("visible", c)} />
        </div>
        <div className="space-y-2">
          <Input value={btn.label} onChange={(e) => updateBtn("label", e.target.value)} placeholder="버튼 라벨" className="h-8 text-sm" />
          <Input value={btn.description} onChange={(e) => updateBtn("description", e.target.value)} placeholder="설명" className="h-8 text-sm" />
          <Input value={btn.url} onChange={(e) => updateBtn("url", e.target.value)} placeholder="URL" className="h-8 text-xs font-mono" />
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("notice");

  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const getAnalytics = useGetAnalytics();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (settings && isOpen && !formData) {
      const safeSettings = {
        ...DEFAULT_SETTINGS,
        ...settings,
        buttons: settings.buttons?.length ? settings.buttons : DEFAULT_SETTINGS.buttons,
        channelOrder: settings.channelOrder?.length ? settings.channelOrder : DEFAULT_SETTINGS.channelOrder,
      };
      setFormData(safeSettings);
    }
  }, [settings, isOpen]);

  useEffect(() => {
    if (isOpen && password) {
      getAnalytics.mutate({ data: { password } });
    }
  }, [isOpen, password]);

  const handleAdminClick = () => {
    const storedPw = sessionStorage.getItem("adminPassword");
    if (storedPw) {
      setPassword(storedPw);
      setIsOpen(true);
    } else {
      setPasswordOpen(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) { setPasswordError("비밀번호를 입력해주세요."); return; }
    sessionStorage.setItem("adminPassword", password);
    setPasswordOpen(false);
    setIsOpen(true);
    setPasswordError("");
  };

  const handleSave = () => {
    if (!formData) return;
    updateSettings.mutate({
      data: { password: password || sessionStorage.getItem("adminPassword") || "", ...formData }
    }, {
      onSuccess: () => {
        toast({ title: "저장되었습니다." });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setIsOpen(false);
      },
      onError: () => {
        toast({ title: "저장 실패 (비밀번호 확인)", variant: "destructive" });
        sessionStorage.removeItem("adminPassword");
        setPassword("");
        setIsOpen(false);
        setPasswordOpen(true);
      }
    });
  };

  const handleReset = () => {
    updateSettings.mutate({
      data: { password: password || sessionStorage.getItem("adminPassword") || "", ...DEFAULT_SETTINGS }
    }, {
      onSuccess: () => {
        toast({ title: "기본값으로 초기화되었습니다." });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setIsOpen(false);
      },
      onError: () => { toast({ title: "저장 실패", variant: "destructive" }); }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev: any) => {
        const oldIndex = prev.channelOrder.indexOf(active.id as string);
        const newIndex = prev.channelOrder.indexOf(over.id as string);
        return { ...prev, channelOrder: arrayMove(prev.channelOrder, oldIndex, newIndex) };
      });
    }
  };

  const parseCommaSeparated = (str: string) => str.split(",").map(s => s.trim()).filter(Boolean);
  const joinCommaSeparated = (arr: string[]) => (arr || []).join(", ");

  return (
    <>
      <div className="absolute bottom-6 left-0 right-0 text-center z-50">
        <button onClick={handleAdminClick} className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground transition-colors px-4 py-2">
          관리자
        </button>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-2xl">
          <DialogHeader><DialogTitle>관리자 비밀번호</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                type="password"
                placeholder="비밀번호 4자리"
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter><Button onClick={handlePasswordSubmit}>확인</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setFormData(null); }}>
        <DialogContent className="max-w-[95%] max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-2xl p-0 flex flex-col">
          <DialogHeader className="p-6 pb-2"><DialogTitle>이벤트 관리</DialogTitle></DialogHeader>

          {formData && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="notice" className="text-xs">공지/상태</TabsTrigger>
                  <TabsTrigger value="events" className="text-xs">이벤트</TabsTrigger>
                  <TabsTrigger value="channels" className="text-xs">채널</TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs">통계</TabsTrigger>
                </TabsList>

                <TabsContent value="notice" className="space-y-4 outline-none">
                  <div className="grid gap-2"><Label>페이지 제목</Label><Input value={formData.pageTitle} onChange={(e) => setFormData({...formData, pageTitle: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>날짜 범위</Label><Input value={formData.dateRange} onChange={(e) => setFormData({...formData, dateRange: e.target.value})} /></div>
                  <div className="grid gap-2">
                    <Label>진행 상태</Label>
                    <Select value={formData.eventStatus} onValueChange={(val) => setFormData({...formData, eventStatus: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="전체 이벤트 진행 중">전체 이벤트 진행 중</SelectItem>
                        <SelectItem value="인스타 인증 이벤트만 진행 중">인스타 인증 이벤트만 진행 중</SelectItem>
                        <SelectItem value="빠른 참여 이벤트만 진행 중">빠른 참여 이벤트만 진행 중</SelectItem>
                        <SelectItem value="증정품 소진">증정품 소진</SelectItem>
                        <SelectItem value="이벤트 일시 중단">이벤트 일시 중단</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label>공지 제목</Label><Input value={formData.noticeTitle} onChange={(e) => setFormData({...formData, noticeTitle: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>공지 본문</Label><Textarea rows={3} value={formData.noticeBody} onChange={(e) => setFormData({...formData, noticeBody: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>강조 안내 문구</Label><Input value={formData.highlightMessage} onChange={(e) => setFormData({...formData, highlightMessage: e.target.value})} /></div>
                </TabsContent>

                <TabsContent value="events" className="space-y-6 outline-none">
                  <div className="p-4 border rounded-xl space-y-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-bold text-red-600">메인 이벤트 (인스타 인증)</Label>
                      <Switch checked={formData.mainEventActive} onCheckedChange={(c) => setFormData({...formData, mainEventActive: c})} />
                    </div>
                    <div className="grid gap-2"><Label>혜택 배지</Label><Input value={formData.mainEventBenefit} onChange={(e) => setFormData({...formData, mainEventBenefit: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>제목</Label><Input value={formData.mainEventTitle} onChange={(e) => setFormData({...formData, mainEventTitle: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>설명</Label><Textarea rows={3} value={formData.mainEventDescription} onChange={(e) => setFormData({...formData, mainEventDescription: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>필수 해시태그 (쉼표 구분)</Label><Input value={joinCommaSeparated(formData.mainEventHashtagsRequired)} onChange={(e) => setFormData({...formData, mainEventHashtagsRequired: parseCommaSeparated(e.target.value)})} /></div>
                    <div className="grid gap-2"><Label>추천 해시태그 (쉼표 구분)</Label><Input value={joinCommaSeparated(formData.mainEventHashtagsRecommended)} onChange={(e) => setFormData({...formData, mainEventHashtagsRecommended: parseCommaSeparated(e.target.value)})} /></div>
                  </div>
                  <div className="p-4 border rounded-xl space-y-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-bold text-orange-500">빠른 참여 이벤트</Label>
                      <Switch checked={formData.subEventActive} onCheckedChange={(c) => setFormData({...formData, subEventActive: c})} />
                    </div>
                    <div className="grid gap-2"><Label>혜택 배지</Label><Input value={formData.subEventBenefit} onChange={(e) => setFormData({...formData, subEventBenefit: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>제목</Label><Input value={formData.subEventTitle} onChange={(e) => setFormData({...formData, subEventTitle: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>설명</Label><Textarea rows={3} value={formData.subEventDescription} onChange={(e) => setFormData({...formData, subEventDescription: e.target.value})} /></div>
                  </div>
                  <div className="p-4 border rounded-xl space-y-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-bold text-amber-500">베스트 리뷰 PLUS EVENT</Label>
                      <Switch checked={formData.plusEventActive} onCheckedChange={(c) => setFormData({...formData, plusEventActive: c})} />
                    </div>
                    <div className="grid gap-2"><Label>혜택 배지</Label><Input value={formData.plusEventBenefit} onChange={(e) => setFormData({...formData, plusEventBenefit: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>제목</Label><Input value={formData.plusEventTitle} onChange={(e) => setFormData({...formData, plusEventTitle: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>설명</Label><Textarea rows={4} value={formData.plusEventDescription} onChange={(e) => setFormData({...formData, plusEventDescription: e.target.value})} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="channels" className="outline-none">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={formData.channelOrder} strategy={verticalListSortingStrategy}>
                      {formData.channelOrder.map((channelId: string) => (
                        <SortableChannelCard key={channelId} channelId={channelId} formData={formData} setFormData={setFormData} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </TabsContent>

                <TabsContent value="stats" className="outline-none space-y-4">
                  <div className="flex justify-end mb-2">
                    <Button variant="outline" size="sm" onClick={() => getAnalytics.mutate({ data: { password } })} disabled={getAnalytics.isPending}>
                      새로고침
                    </Button>
                  </div>
                  {getAnalytics.data ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-primary/10 p-4 rounded-xl text-center">
                          <div className="text-xs text-muted-foreground font-semibold mb-1">총 페이지 방문</div>
                          <div className="text-2xl font-bold text-primary">{(getAnalytics.data as any).pageViews.toLocaleString()}</div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-xl text-center">
                          <div className="text-xs text-muted-foreground font-semibold mb-1">총 버튼 클릭</div>
                          <div className="text-2xl font-bold text-primary">{(getAnalytics.data as any).totalClicks.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-6">
                        <Label className="text-muted-foreground">채널별 클릭 통계</Label>
                        {Object.entries((getAnalytics.data as any).channelStats).map(([ch, stat]: [string, any]) => {
                          const iconData = CHANNEL_ICONS[ch];
                          const IconComp = iconData?.icon;
                          const nameMap: Record<string,string> = { instagram: "인스타그램", naver: "네이버", kakao: "카카오톡", youtube: "유튜브" };
                          return (
                            <div key={ch} className="bg-card border p-3 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {IconComp && <IconComp className={`w-4 h-4 ${iconData.color}`} />}
                                <span className="font-semibold text-sm">{nameMap[ch] || ch}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div><span className="font-bold">{stat.clicks}</span>회</div>
                                <div className="text-muted-foreground text-xs text-right w-16">평균 {((stat.avgDwellMs || 0)/1000).toFixed(1)}초</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">통계 데이터를 불러오는 중...</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="p-6 pt-2 flex-col sm:flex-row gap-2 border-t">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">기본값 복구</Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">닫기</Button>
              <Button onClick={handleSave} className="flex-1">저장하기</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
