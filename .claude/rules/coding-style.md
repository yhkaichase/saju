# 코딩 컨벤션

## 언어/타입

- **TypeScript strict 모드**를 유지합니다. `any`는 금지하고 불가피하면 `unknown` + 좁히기.
- 도메인 모델은 타입으로 먼저 정의합니다 (`src/types/`).
- 외부 입력(폼/쿼리/API)은 경계에서 검증합니다 (예: zod).

## 네이밍

- 도메인 용어는 한글/한자 병기로 주석을 남기되, **식별자는 영문으로 통일**합니다.
  - 천간 → `heavenlyStem`, 지지 → `earthlyBranch`
  - 오행 → `fiveElements`, 십신 → `tenGods`, 대운 → `majorFortune`
  - 연/월/일/시주 → `yearPillar` / `monthPillar` / `dayPillar` / `hourPillar`
- 함수는 동사로, 불리언은 `is/has/should` 접두사.
- 파일명은 kebab-case, React 컴포넌트 파일은 PascalCase.

## 구조

- 순수 계산 로직(`src/lib/saju`, `src/lib/calendar`)은 **부수효과 없이** 작성하고,
  I/O·UI와 분리합니다. 테스트하기 쉬운 순수 함수를 우선합니다.
- 매직 넘버/간지 배열 같은 상수는 명명된 상수로 추출하고 출처를 주석으로 남깁니다.

## 포맷/린트

- 저장 시 Prettier 포맷 (PostToolUse 훅이 자동 처리).
- 커밋 전 `pnpm lint`와 `pnpm test`를 통과시킵니다.

## 주석

- "무엇"이 아니라 "왜"를 적습니다. 도메인 규칙(절기 경계, 야자시 처리 등)은
  근거/출처를 함께 남깁니다.
