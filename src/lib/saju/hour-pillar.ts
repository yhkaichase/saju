/**
 * 시주(時柱, hour pillar) 계산.
 *
 * 시주 = 시지(時支) + 시간(時干).
 *
 * ## 시지(時支) — 12지지, 2시간 단위
 *   자시(子時)는 23:00에 시작해 하루를 가로지릅니다(23:00~01:00).
 *   경계는 **시작 포함 / 끝 배타**(inclusive start / exclusive end)로 처리합니다.
 *   예: 정확히 01:00은 축시, 13:00은 미시, 23:00은 자시.
 *
 * ## 시간(時干) — 오서둔(五鼠遁)
 *   일간(日干)에 따라 자시(子時)의 천간이 정해지고 이후 순행합니다(원전 가결:
 *   甲己還加甲, 乙庚丙作初, 丙辛從戊起, 丁壬庚子居, 戊癸壬子是真途).
 *   닫힌 공식(120조합 전수검증):
 *     hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10
 *   여기서 dayStemIndex 는 **그 시점에 적용되는 일주(日柱)의 일간** index 입니다.
 *
 * ## 야자시(夜子時)/조자시(朝子時) × 일간 — 정책 SSOT
 *   시주 천간은 항상 "그 시점의 일주 일간"에서 도출됩니다. 따라서 야자시/조자시
 *   분기는 **일주 계산(calculateDayPillar)의 dayBoundaryPolicy 가 단일 진실원천**이
 *   되도록 합니다. 시주 코드에 별도 보정 분기를 넣지 않습니다.
 *   - "midnight"(기본): 일주가 자정에 바뀜 → 23:30·00:30 모두 출생일 당일 일간 기준.
 *   - "zishi23": 23:00부터 다음 일주 → 23:30은 익일 일간 기준, 00:30은 당일 일간 기준.
 *
 * 근거: saju-domain-expert 에이전트 검증(算准网/知乎 원전 가결 교차확인),
 *       .claude/rules/saju-domain.md (시주 결정 — 오서둔/야자시·조자시).
 *       (커밋 전 KASI 만세력으로 골든 1~2개 육안 대조 권장)
 */

import { EARTHLY_BRANCHES, HEAVENLY_STEMS, sexagenaryIndexOf, SEXAGENARY_CYCLE } from "./constants";
import { calculateDayPillar, type DayPillarInput } from "./day-pillar";
import type { SexagenaryPair } from "@/types/saju";

/** 시주 계산 입력은 일주 입력과 동일 — KST 벽시계 + 경계 정책을 공유합니다. */
export type HourPillarInput = DayPillarInput;

/** 천간 개수 — 오서둔 모듈러 연산용. */
const HEAVENLY_STEM_COUNT = 10;

/** 자시(子時) 시작 시각(분): 23:00. */
const ZISHI_START_MINUTES = 23 * 60;
/** 축시(丑時) 시작 시각(분): 01:00. 이 이전(자시 후반)은 子. */
const CHUSI_START_MINUTES = 60;
/** 시지 한 칸의 길이(분): 2시간. */
const BRANCH_SPAN_MINUTES = 120;

/**
 * KST 벽시계 시·분으로 시지(時支) index(0=子 … 11=亥)를 구합니다.
 * 시작 포함 / 끝 배타. 자시는 23:00~01:00으로 하루를 가로지릅니다.
 */
export function hourToBranchIndex(hour: number, minute = 0): number {
  const t = hour * 60 + minute;
  // 23:00~23:59(야자시) 또는 00:00~00:59(조자시) → 子.
  if (t >= ZISHI_START_MINUTES || t < CHUSI_START_MINUTES) {
    return 0;
  }
  // 01:00을 기준으로 2시간씩: 丑(1)부터.
  return Math.floor((t - CHUSI_START_MINUTES) / BRANCH_SPAN_MINUTES) + 1;
}

/**
 * 주어진 KST 양력 날짜/시각의 시주(時柱) 간지를 반환합니다.
 *
 * 시주 천간은 동일 경계 정책으로 계산한 일주의 일간에서 도출됩니다(SSOT).
 */
export function calculateHourPillar(input: HourPillarInput): SexagenaryPair {
  const { hour = 0, minute = 0 } = input;

  // 시점에 적용되는 일주 → 그 일간이 오서둔의 기준 (야자시/조자시 SSOT).
  const dayPillar = calculateDayPillar(input);
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.heavenlyStem);

  const hourBranchIndex = hourToBranchIndex(hour, minute);
  const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % HEAVENLY_STEM_COUNT;

  // 오서둔은 항상 유효한 간지 패리티(천간 짝/홀 ↔ 지지 짝/홀)를 만들므로 역산이 안전.
  const cycleIndex = sexagenaryIndexOf(
    HEAVENLY_STEMS[hourStemIndex],
    EARTHLY_BRANCHES[hourBranchIndex],
  );

  return SEXAGENARY_CYCLE[cycleIndex];
}
