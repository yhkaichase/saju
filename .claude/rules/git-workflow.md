# Git 워크플로

## 브랜치

- `main`에 직접 커밋하지 않습니다. 기능 단위 브랜치에서 작업합니다.
- 브랜치 네이밍: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `refactor/...`
  - 예: `feat/month-pillar-by-solar-term`

## 커밋 메시지

- [Conventional Commits](https://www.conventionalcommits.org) 형식.
  - `feat: 절기 기준 월주 결정 로직 추가`
  - `fix: 야자시 일주 처리 오류 수정`
  - `test: 알려진 명식 골든 테스트 추가`
- 제목은 명령형, 본문에는 "왜"를 설명. 한 커밋은 한 가지 논리적 변경.

## PR

- PR은 작게, 리뷰 가능하게. 도메인 계산 변경 시 **근거/출처**와 **테스트 결과**를 본문에 포함.
- 사용자가 명시적으로 요청하기 전에는 PR을 생성하지 않습니다.

## 푸시 전 체크

- `pnpm lint` / `pnpm test` 통과 확인.
- 계산 로직을 바꿨다면 골든 테스트가 깨지지 않았는지 확인.
