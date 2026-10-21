@AGENTS.md

## 세션 시작 규칙
- 새 대화를 시작하면 가장 먼저 `docs/WORKLOG.md`를 읽고, "다음 할 일"을 사용자에게 한 줄로 요약해 알린다.
- 작업을 마칠 때마다 `docs/WORKLOG.md`의 "다음 할 일", "진행 현황", "기록"을 갱신하고 같은 PR에 포함한다.

## PR 규칙
- `main`에 직접 커밋·푸시하지 않는다. 작업마다 브랜치(`feat/…`, `fix/…`, `docs/…`)를 만들고 PR로 병합한다.
- PR 하나는 목적 하나(예: Phase 2의 일정 CRUD)만 다룬다.
- PR 생성 전 `npm run lint && npm test && npm run build`가 통과해야 하며, 결과를 PR 본문에 적는다.
- PR 본문에는 변경 요약, 검증 방법, DB 변경 여부(마이그레이션 파일명)를 포함한다.
- DB 스키마 변경은 `supabase/migrations/`에 새 번호 파일로 추가하고, 기존 마이그레이션 파일은 수정하지 않는다.
- 병합은 사용자가 확인한 뒤에 한다 (squash merge 권장).
