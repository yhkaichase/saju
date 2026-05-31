# saju (四柱)

생년월일시를 입력받아 만세력 기반으로 **사주(四柱八字)**를 계산·해석하는
풀스택 웹 서비스. 연·월·일·시 4기둥의 천간·지지와 오행·십신·대운을 산출합니다.

> 도메인 계산은 **정확성이 최우선**입니다. 음양력 변환·절기 기준 월주·야자시/조자시
> 처리 등은 추정 없이 근거를 명시합니다. 규칙: `.claude/rules/saju-domain.md`.

## 기술 스택

- TypeScript (strict) · Next.js 16 (App Router) · Tailwind CSS v4 · pnpm
- 테스트: Vitest · 천문 계산: `astronomy-engine`
- 계산 코어(`src/lib`)는 Next에 의존하지 않는 **순수 모듈**로 격리

## 개발

```bash
pnpm install
pnpm dev            # 개발 서버 (http://localhost:3000)
pnpm test           # 단위/골든 테스트
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm build          # 프로덕션 빌드
```

## 계산 코어 (`src/lib`)

순수 함수는 **KST 벽시계(연·월·일·시·분)**를 입력으로 받습니다(타임존 흔들림 방지).

```ts
import { calculateFourPillars, calculateMajorFortune, tenGodOfStem } from "@/lib/saju";

const pillars = calculateFourPillars({ year: 1984, month: 6, day: 15, hour: 12, minute: 30 });
// → { yearPillar: 甲子, monthPillar: 庚午, dayPillar: 庚辰, hourPillar: 壬午 }

const fortune = calculateMajorFortune({
  year: 1984,
  month: 6,
  day: 15,
  hour: 12,
  minute: 30,
  gender: "male",
});
// → 순행, 대운수 7, [辛未, 壬申, 癸酉, ...]
```

| 모듈                   | 내용                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| `saju/day-pillar`      | 일주 — 검증된 epoch(1949-10-01=甲子) + 60갑자. 자정/자시 경계 정책 |
| `saju/hour-pillar`     | 시주 — 시지 경계 + 오서둔. 야자시/조자시는 일주 정책을 SSOT로      |
| `saju/year-pillar`     | 연주 — 입춘 절입 경계 + 연간지                                     |
| `saju/month-pillar`    | 월주 — 태양황경 기반 절기 월지 + 오호둔. 연주 연간을 SSOT로        |
| `saju/five-elements`   | 오행 매핑·생극. 지지는 본기(本氣)에서 파생                         |
| `saju/ten-gods`        | 십신 — 일간 기준. 음양 비교는 지지 본기 사용                       |
| `saju/major-fortune`   | 대운 — 순행/역행·대운수·간지 나열                                  |
| `calendar/solar-terms` | 절기 황경·절입 시각 (astronomy-engine)                             |

## 정확성 노트 (미해결)

한국 사주의 정답 기준은 **KASI(한국천문연구원) 공식 만세력**입니다. 현재
`astronomy-engine` 계산값은 공표 만세력과 ±1분 수준으로 일치하나, 아래 두 가지는
KASI 공식값과의 **육안 대조가 남아 있습니다**:

1. 절기·입춘 절입 시각의 분 단위 정답 (경계 출생 케이스에 영향)
2. 대운수(大運數)의 반올림·0시작 경계 관례 (학파차 존재 — 현재 기본 `round`)
