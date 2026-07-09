# Vercel 배포 가이드

## 필요한 것
- [GitHub](https://github.com) 계정 (무료)
- [Vercel](https://vercel.com) 계정 (무료)
- [Upstash](https://upstash.com) 계정 (무료) — 설정/통계 저장용

---

## 1단계: Upstash Redis 설정 (5분)

1. [console.upstash.com](https://console.upstash.com) 접속 → 무료 계정 생성
2. **Create Database** 클릭
3. 이름: `masidduck-event`, Region: `ap-northeast-1 (Tokyo)` 선택 → Create
4. 생성된 DB 클릭 → **REST API** 탭 열기
5. 두 값을 메모해두기:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 2단계: GitHub에 올리기

```bash
# vercel-deploy 폴더를 새 GitHub 레포지토리로 올리기
cd vercel-deploy
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/[내아이디]/masidduck-event.git
git push -u origin main
```

---

## 3단계: Vercel에 배포 (3분)

1. [vercel.com/new](https://vercel.com/new) 접속
2. GitHub 연결 → `masidduck-event` 레포 선택
3. **Environment Variables** 섹션에서 아래 3개 추가:

| Key | Value |
|-----|-------|
| `UPSTASH_REDIS_REST_URL` | 1단계에서 복사한 URL |
| `UPSTASH_REDIS_REST_TOKEN` | 1단계에서 복사한 토큰 |
| `ADMIN_PASSWORD` | `0710` |

4. **Deploy** 클릭

배포 완료 후 `https://masidduck-event.vercel.app` 같은 주소가 생깁니다.

---

## 이후 설정 변경이 필요하면?
Vercel 대시보드 → Settings → Environment Variables에서 수정하면 됩니다.
