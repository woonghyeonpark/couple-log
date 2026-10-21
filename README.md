# 커플 로그 💑

둘만 쓰는 공유 캘린더 & 주말 플래너 (모바일 웹 프로토타입).
Next.js(App Router) · Tailwind · Supabase(Auth/DB) · Cloudflare R2(사진) · Vercel.

작업지시서의 단계별 진행 상황: **Phase 1(기반) 완료** → Phase 2(캘린더·일정·기록) → Phase 3(사진) → Phase 4(위시·투표) → Phase 5(다듬기·배포)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev                  # http://localhost:3000
npm run build && npm run lint && npm test
```

## 사람이 직접 할 일 (체크리스트)

### Supabase
- [ ] 1. 프로젝트 생성 (리전: Northeast Asia - Seoul)
- [ ] 2. SQL Editor에서 `supabase/migrations/0001_init.sql` 전체를 실행
- [ ] 3. Authentication → Sign In / Providers에서 **Allow new users to sign up 끄기** (신규 가입 비활성화)
- [ ] 4. Authentication → Users에서 계정 2개 생성 (**Auto Confirm User** 체크, 이메일+비밀번호)
- [ ] 5. Project Settings → API에서 `Project URL`(예: `https://jxzcgsitjvmbesdhvdli.supabase.co`)과 `anon`(또는 publishable) 키를 복사해 로컬 `.env.local`에 직접 입력 (키 값은 커밋하지 않음)
  - 새 키 체계(`sb_publishable_...`)도 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 그대로 넣으면 됩니다.
  - `service_role`/secret 키는 이 앱에서 쓰지 않습니다. 넣지 마세요.

계정을 만들면 `profiles` 행이 트리거로 자동 생성됩니다. 이름·이모지·색상은 앱의 설정 화면에서 바꿉니다.

### Supabase MCP (로컬 개발용, 선택)
AI가 스키마·RLS·어드바이저 조회, 마이그레이션 적용 등을 하게 해 주는 개발 도구입니다. 앱 실행에는 필요 없습니다.
저장소의 `.mcp.json`에 **쓰기 가능**(`read_only` 없음) 상태로 설정되어 있어요. 실제 DB에 바로 반영되니 주의하세요.

1. 저장소를 받은 뒤 **일반 터미널**(IDE 확장 아님)에서 `claude /mcp` → `supabase` 선택 → Authenticate (브라우저 로그인)
2. (선택) 에이전트 스킬: `npx skills add supabase/agent-skills`
3. 읽기 전용으로 되돌리려면 `.mcp.json` URL에 `read_only=true`를 추가하세요.

> 클라우드(웹) 세션에서는 `mcp.supabase.com`이 네트워크 정책에 막혀 있고 브라우저 인증도 어려워 로컬 사용을 기준으로 합니다.

### Cloudflare R2 (Phase 3부터 필요)
- [ ] 6. Cloudflare에서 R2 활성화 (결제수단 등록을 요구할 수 있음. 무료 구간 안에서는 과금 없음)
- [ ] 7. 버킷 생성 (예: `couple-photos`), **공개 접근 끔**
- [ ] 8. R2 API 토큰 생성: 권한 "Object Read & Write", 해당 버킷으로 한정
- [ ] 9. 버킷 CORS 설정 (배포 도메인은 배포 후 추가):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://<배포-도메인>"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

### 환경변수

| 이름 | 노출 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 | anon/publishable 키 |
| `R2_ACCOUNT_ID` | 서버 전용 | Cloudflare 계정 ID |
| `R2_ACCESS_KEY_ID` | 서버 전용 | R2 API 토큰의 Access Key |
| `R2_SECRET_ACCESS_KEY` | 서버 전용 | R2 API 토큰의 Secret Key |
| `R2_BUCKET` | 서버 전용 | 버킷 이름 |

서버 전용 값에는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.

### 배포 (Phase 5에서 가이드 보강)
- [ ] 10. `.env.local`에 환경변수 입력 후 로컬에서 로그인 확인
- [ ] 11. Vercel에 GitHub 저장소 연결, 환경변수 동일하게 등록, 배포 후 R2 CORS에 실제 도메인 추가

### 여자친구 폰
- [ ] 12. 사파리에서 접속 → 공유 → 홈 화면에 추가 → 로그인 (이메일+비밀번호 방식이라 홈 화면 앱에서도 로그인이 유지됩니다)

## 구조

- `proxy.ts`, `lib/supabase/proxy.ts` — 세션 갱신, 비로그인 시 `/login`으로 이동 (Next.js 16에서 `middleware`는 `proxy`로 이름이 바뀜)
- `lib/supabase/{client,server}.ts` — 브라우저용/서버용 Supabase 클라이언트
- `lib/week.ts` — Asia/Seoul 기준 주 계산. 일요일에는 다음 주를 투표 대상 주로 봅니다.
- `supabase/migrations/0001_init.sql` — 테이블, 함수, 트리거, RLS 전부
- `components/ui/*` — shadcn/ui 스타일 컴포넌트 (CLI 대신 직접 작성)
- 테마 색은 `app/globals.css`의 `--brand` 변수 하나로 바꿉니다.
