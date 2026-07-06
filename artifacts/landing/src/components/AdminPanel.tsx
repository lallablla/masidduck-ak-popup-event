import React, { useState, useEffect, useRef } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SettingsInputEventStatus } from "@workspace/api-zod/src/generated/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    noticeTitle: "",
    noticeBody: "",
    eventStatus: "진행 중" as SettingsInputEventStatus,
    highlightMessage: "",
    showInstagram: true,
    showNaver: true,
    showKakao: true,
    showYoutube: true,
  });

  useEffect(() => {
    if (settings && isOpen) {
      setFormData({
        noticeTitle: settings.noticeTitle,
        noticeBody: settings.noticeBody,
        eventStatus: settings.eventStatus as SettingsInputEventStatus,
        highlightMessage: settings.highlightMessage,
        showInstagram: settings.showInstagram,
        showNaver: settings.showNaver,
        showKakao: settings.showKakao,
        showYoutube: settings.showYoutube,
      });
    }
  }, [settings, isOpen]);

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
    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }
    // We will just open the panel, validation happens on save
    sessionStorage.setItem("adminPassword", password);
    setPasswordOpen(false);
    setIsOpen(true);
    setPasswordError("");
  };

  const handleSave = () => {
    updateSettings.mutate({
      data: {
        password: password || sessionStorage.getItem("adminPassword") || "",
        ...formData
      }
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
    const defaultData = {
      noticeTitle: "안내사항",
      noticeBody: "이벤트에 참여해주셔서 감사합니다.",
      eventStatus: "진행 중" as SettingsInputEventStatus,
      highlightMessage: "",
      showInstagram: true,
      showNaver: true,
      showKakao: true,
      showYoutube: true,
    };
    
    updateSettings.mutate({
      data: {
        password: password || sessionStorage.getItem("adminPassword") || "",
        ...defaultData
      }
    }, {
      onSuccess: () => {
        toast({ title: "기본값으로 초기화되었습니다." });
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

  return (
    <>
      <div className="mt-16 mb-8 text-center">
        <button 
          onClick={handleAdminClick}
          data-testid="button-admin"
          className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground transition-colors"
        >
          관리자
        </button>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle>관리자 비밀번호</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 4자리"
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95%] max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>이벤트 설정 (관리자)</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="noticeTitle">공지 제목</Label>
              <Input 
                id="noticeTitle" 
                value={formData.noticeTitle} 
                onChange={(e) => setFormData({...formData, noticeTitle: e.target.value})} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="noticeBody">공지 본문</Label>
              <Textarea 
                id="noticeBody" 
                rows={4}
                value={formData.noticeBody} 
                onChange={(e) => setFormData({...formData, noticeBody: e.target.value})} 
              />
            </div>

            <div className="grid gap-2">
              <Label>진행 상태</Label>
              <Select 
                value={formData.eventStatus} 
                onValueChange={(val: any) => setFormData({...formData, eventStatus: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="진행 중">진행 중</SelectItem>
                  <SelectItem value="일시 중단">일시 중단</SelectItem>
                  <SelectItem value="증정품 소진">증정품 소진</SelectItem>
                  <SelectItem value="빠른 참여만 진행 중">빠른 참여만 진행 중</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="highlightMessage">강조 안내 문구</Label>
              <Input 
                id="highlightMessage" 
                value={formData.highlightMessage} 
                onChange={(e) => setFormData({...formData, highlightMessage: e.target.value})} 
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">버튼 노출 설정</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="showInsta" className="font-normal">인스타그램 팔로우</Label>
                <Switch 
                  id="showInsta" 
                  checked={formData.showInstagram} 
                  onCheckedChange={(c) => setFormData({...formData, showInstagram: c})} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showNaver" className="font-normal">네이버 저장·알림받기</Label>
                <Switch 
                  id="showNaver" 
                  checked={formData.showNaver} 
                  onCheckedChange={(c) => setFormData({...formData, showNaver: c})} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showKakao" className="font-normal">카카오톡 채널추가</Label>
                <Switch 
                  id="showKakao" 
                  checked={formData.showKakao} 
                  onCheckedChange={(c) => setFormData({...formData, showKakao: c})} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showYoutube" className="font-normal">유튜브 구독</Label>
                <Switch 
                  id="showYoutube" 
                  checked={formData.showYoutube} 
                  onCheckedChange={(c) => setFormData({...formData, showYoutube: c})} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleReset} data-testid="button-admin-reset" className="w-full sm:w-auto">
              기본값 복구
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => setIsOpen(false)} data-testid="button-admin-close" className="flex-1">
                닫기
              </Button>
              <Button onClick={handleSave} data-testid="button-admin-save" className="flex-1">
                저장하기
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
