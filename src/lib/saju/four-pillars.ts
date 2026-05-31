/**
 * 사주(四柱) 통합 계산 — 연·월·일·시 네 기둥을 한 번에.
 *
 * 입력은 순수성을 위해 **KST 벽시계**(연·월·일·시·분)로 통일합니다. JS `Date`를
 * 직접 받지 않는 이유는 실행 환경 타임존에 따라 벽시계가 흔들리는 것을 막기
 * 위함입니다(UI/API 경계에서 KST 벽시계로 분해해 전달).
 *
 * 경계 정책(`dayBoundaryPolicy`)은 네 기둥에 일관되게 전파됩니다:
 *   - 일주/시주: 야자시·조자시 SSOT(일주 일간 기준).
 *   - 연주/월주: 입춘 경계(절기 기반, 경계 정책과 무관하게 절입 시각으로 판정).
 */

import { calculateDayPillar, type DayPillarInput } from "./day-pillar";
import { calculateHourPillar } from "./hour-pillar";
import { calculateMonthPillar } from "./month-pillar";
import { calculateYearPillar } from "./year-pillar";
import type { FourPillars } from "@/types/saju";

/** 사주 계산 입력 — KST 벽시계. */
export type FourPillarsInput = DayPillarInput;

/** 주어진 KST 출생 시각의 사주(四柱) 네 기둥을 모두 계산합니다. */
export function calculateFourPillars(input: FourPillarsInput): FourPillars {
  return {
    yearPillar: calculateYearPillar(input),
    monthPillar: calculateMonthPillar(input),
    dayPillar: calculateDayPillar(input),
    hourPillar: calculateHourPillar(input),
  };
}
