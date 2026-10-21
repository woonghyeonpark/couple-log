# 작업 기록 (WORKLOG)

새 대화를 시작하면 이 파일을 먼저 읽고 "다음 할 일"부터 이어간다. 작업을 끝낼 때마다 갱신한다.

## 다음 할 일
1. Supabase MCP 인증 (사람이 일반 터미널에서 `claude /mcp` → supabase → Authenticate)
2. `supabase/migrations/0001_init.sql` 을 Supabase 프로젝트(`jxzcgsitjvmbesdhvdli`)에 적용
3. 가입 비활성화, 계정 2개 생성, `.env.local` 작성 (README 체크리스트 1~5)
4. Phase 2: 캘린더 · 일정 · 기록

## 진행 현황
- Phase 1 (기반: 인증, 스키마, 레이아웃, 설정) — 완료
- Phase 2 (캘린더·일정·기록) — 대기
- Phase 3 (사진, Cloudflare R2) — 대기
- Phase 4 (위시·투표) — 대기
- Phase 5 (다듬기·배포) — 대기

## 기록 (최신이 위)
### 2026-10-21
- `.mcp.json`의 Supabase MCP를 쓰기 가능으로 변경 (`read_only` 제거, account/functions/branching 기능 추가). README 해당 설명 갱신.
- 작업 기록(`docs/WORKLOG.md`)과 CLAUDE.md의 세션 시작/PR 규칙 추가.
- 원격 브랜치 `claude/affectionate-archimedes-jotlat`(Phase 1)을 main에 fast-forward 병합.
