/**
 * 대운(大運) — 10년 단위로 흐르는 운의 간지 흐름과 시작 나이(대운수).
 *
 * ## 순행/역행
 *   연간(年干)의 음양 × 성별로 결정합니다.
 *   - 陽男·陰女 = 순행(順行), 陰男·陽女 = 역행(逆行).
 *   - 음양 기준은 **연간(천간)** 이며, 입춘 경계로 확정된 연주를 씁니다.
 *
 * ## 대운 간지 나열 — 월주의 "다음/이전"부터
 *   첫 대운은 월주(月柱) 자체가 아니라 60갑자에서 월주의 다음(순행)/이전(역행)
 *   간지입니다. 이후 ±1씩 진행합니다.
 *
 * ## 대운수(시작 나이)
 *   - 순행: 출생 → 다음 節 절입까지의 일수.
 *   - 역행: 출생 → 직전 節 절입까지의 일수.
 *   - 3일 = 1년 (일수 ÷ 3).
 *
 *   ⚠️ 반올림/0시작 관례는 학파·만세력별로 갈립니다(에이전트 검증). 여기서는
 *   **정밀 실수값(fortuneStartAgePrecise)을 함께 보관**하고, 표시용 정수는
 *   기본 정책 "반올림(round)"으로 산출합니다. 정확한 경계 정책은 KASI 공식
 *   만세력과 골든 대조 후 확정해야 합니다(미해결 TODO).
 *
 * 근거: saju-domain-expert 에이전트 검증(위키백과 대운 등). .claude/rules/saju-domain.md
 */

import { kstWallClockToUtc } from "@/lib/calendar/timezone";
import { nextSolarTermInstant, previousSolarTermInstant } from "@/lib/calendar/solar-terms";
import { SEXAGENARY_CYCLE, sexagenaryIndexOf } from "./constants";
import type { DayPillarInput } from "./day-pillar";
import { HEAVENLY_STEM_YIN_YANG } from "./five-elements";
import { calculateMonthPillar } from "./month-pillar";
import { calculateYearPillar, type YearPillarInput } from "./year-pillar";
import type { Gender, HeavenlyStem, SexagenaryPair } from "@/types/saju";

/** 대운 진행 방향. */
export type FortuneDirection = "forward" | "backward";

/** 대운수 표시 정수의 반올림 정책. */
export type FortuneStartAgeRounding = "round" | "floor" | "ceil";

/** 대운 계산 입력 — 출생 정보(KST 벽시계) + 성별. */
export interface MajorFortuneInput extends DayPillarInput {
  gender: Gender;
  /** 대운수 정수 반올림 정책. 기본 "round". */
  fortuneStartAgeRounding?: FortuneStartAgeRounding;
}

/** 대운 한 주기. */
export interface MajorFortunePeriod {
  /** 시작 나이(세). */
  startAge: number;
  pillar: SexagenaryPair;
}

export interface MajorFortuneResult {
  direction: FortuneDirection;
  /** 표시용 대운수(반올림 적용). */
  fortuneStartAge: number;
  /** 정밀 대운수(반올림 전 실수값). KASI 대조·디버깅용. */
  fortuneStartAgePrecise: number;
  periods: MajorFortunePeriod[];
}

const SEXAGENARY_LENGTH = 60;
const DAYS_PER_FORTUNE_YEAR = 3; // 3일 = 1년
const MS_PER_DAY = 24 * 3600 * 1000;
const DEFAULT_PERIOD_COUNT = 8;

/** 연간 음양 × 성별로 순행/역행을 결정합니다. */
export function fortuneDirection(yearStem: HeavenlyStem, gender: Gender): FortuneDirection {
  const isYangYear = HEAVENLY_STEM_YIN_YANG[yearStem] === "陽";
  const forward = (isYangYear && gender === "male") || (!isYangYear && gender === "female");
  return forward ? "forward" : "backward";
}

function applyRounding(value: number, mode: FortuneStartAgeRounding): number {
  if (mode === "floor") return Math.floor(value);
  if (mode === "ceil") return Math.ceil(value);
  return Math.round(value);
}

/**
 * 대운(大運)을 계산합니다 — 방향, 대운수, 그리고 첫 N개 대운 간지.
 *
 * @param periodCount 반환할 대운 개수(기본 8개 = 약 80년).
 */
export function calculateMajorFortune(
  input: MajorFortuneInput,
  periodCount = DEFAULT_PERIOD_COUNT,
): MajorFortuneResult {
  const { year, month, day, hour = 0, minute = 0, gender } = input;
  const rounding = input.fortuneStartAgeRounding ?? "round";

  const yearPillar = calculateYearPillar(input as YearPillarInput);
  const monthPillar = calculateMonthPillar(input);
  const direction = fortuneDirection(yearPillar.heavenlyStem, gender);

  // 대운수: 출생 → (순행)다음 / (역행)직전 절입까지의 일수 ÷ 3.
  const birthUtc = kstWallClockToUtc(year, month, day, hour, minute);
  const boundaryUtc =
    direction === "forward" ? nextSolarTermInstant(birthUtc) : previousSolarTermInstant(birthUtc);
  const diffDays = Math.abs(boundaryUtc.getTime() - birthUtc.getTime()) / MS_PER_DAY;
  const fortuneStartAgePrecise = diffDays / DAYS_PER_FORTUNE_YEAR;
  const fortuneStartAge = applyRounding(fortuneStartAgePrecise, rounding);

  // 간지 나열: 월주의 다음(순행)/이전(역행)부터 ±1.
  const monthIndex = sexagenaryIndexOf(monthPillar.heavenlyStem, monthPillar.earthlyBranch);
  const sign = direction === "forward" ? 1 : -1;
  const periods: MajorFortunePeriod[] = [];
  for (let n = 1; n <= periodCount; n++) {
    const idx =
      (((monthIndex + sign * n) % SEXAGENARY_LENGTH) + SEXAGENARY_LENGTH) % SEXAGENARY_LENGTH;
    periods.push({
      startAge: fortuneStartAge + (n - 1) * 10,
      pillar: SEXAGENARY_CYCLE[idx],
    });
  }

  return { direction, fortuneStartAge, fortuneStartAgePrecise, periods };
}
